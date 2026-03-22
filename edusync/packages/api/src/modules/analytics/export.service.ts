import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../../services/redis-service.js';
import { AnalyticsService } from './service.js';
import { getIO } from '../../socket.js';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import html_to_pdf from 'html-pdf-node';
import fs from 'fs';
import path from 'path';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

export const reportQueue = new Queue('report-generator', { connection });

export class ExportService {
  static async requestReport(campus: string, adminUid: string) {
    await reportQueue.add('generate-roi-report', { campus, adminUid });
  }

  static async generateROIReport(campus: string, adminUid: string) {
    const overview = await AnalyticsService.getOverview(campus);
    const karmaFlow = await AnalyticsService.getKarmaFlow(campus, '30d');
    
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
            .metric-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 30px; }
            .metric-card { padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; }
            .value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Nexus Node ROI Report: ${campus}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          
          <div class="metric-grid">
            <div class="metric-card">
              <div class="label">Total Students</div>
              <div class="value">${overview.totalStudents}</div>
            </div>
            <div class="metric-card">
              <div class="label">Nexus Connectivity</div>
              <div class="value">${overview.nexusEnabledStudents}</div>
            </div>
            <div class="metric-card">
              <div class="label">Certified Resources</div>
              <div class="value">${overview.totalResourcesCertified}</div>
            </div>
            <div class="metric-card">
              <div class="label">MOU Health Score</div>
              <div class="value">${overview.mouUtilization}%</div>
            </div>
          </div>

          <h2 style="margin-top: 40px;">30-Day Karma Flow</h2>
          <p>Net Velocity: ${karmaFlow.aggregate.netVelocity}</p>
          
          <div class="footer">
            CONFIDENTIAL - Institutional Administrative Use Only. 
            EduSync Nexus Framework v1.0
          </div>
        </body>
      </html>
    `;

    const file = { content: htmlContent };
    const options = { format: 'A4' };

    const pdfBuffer = await html_to_pdf.generatePdf(file, options);
    const fileName = `ROI-Report-${campus}-${Date.now()}.pdf`;
    
    // In production, upload to S3/Cloudinary. 
    // For MVP, we'll save to a temp public folder.
    const publicPath = path.join(process.cwd(), 'public', 'reports');
    if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath, { recursive: true });
    
    const filePath = path.join(publicPath, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Notify user via socket
    getIO().to(`user:${adminUid}`).emit('report:ready', {
      downloadUrl: `/reports/${fileName}`,
      reportName: fileName
    });

    console.log(`✅ [ExportService] ROI Report generated for ${campus}: ${fileName}`);
  }
}

// Worker Implementation
export const reportWorker = new Worker('report-generator', async (job: Job) => {
  const { campus, adminUid } = job.data;
  console.log(`📈 [ExportService] Job ${job.id} started: ROI Report for ${campus}`);
  await ExportService.generateROIReport(campus, adminUid);
}, { connection });
