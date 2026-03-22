#!/bin/bash

set -e

# ============================================================================
# EDUSYNC AWS VPC SETUP
# Creates: VPC, Public/Private/Data subnets, NAT Gateway, Route Tables,
#          Internet Gateway, Security Groups
# ============================================================================

AWS_REGION="us-east-1"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.10.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.11.0/24"
DATA_SUBNET_1_CIDR="10.0.20.0/24"
DATA_SUBNET_2_CIDR="10.0.21.0/24"

echo "🌐 Creating VPC..."

# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block $VPC_CIDR \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=edusync-prod-vpc}]" \
  --region $AWS_REGION \
  --query 'Vpc.VpcId' \
  --output text)

echo "✅ VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
  --vpc-id $VPC_ID \
  --enable-dns-hostnames \
  --region $AWS_REGION

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=edusync-igw}]" \
  --region $AWS_REGION \
  --query 'InternetGateway.InternetGatewayId' \
  --output text)

aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID \
  --region $AWS_REGION

echo "✅ Internet Gateway: $IGW_ID"

# Get availability zones
AZ1=$(aws ec2 describe-availability-zones \
  --region $AWS_REGION \
  --query 'AvailabilityZones[0].ZoneName' \
  --output text)

AZ2=$(aws ec2 describe-availability-zones \
  --region $AWS_REGION \
  --query 'AvailabilityZones[1].ZoneName' \
  --output text)

echo "📍 Using AZs: $AZ1, $AZ2"

# Create Public Subnets
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $PUBLIC_SUBNET_1_CIDR \
  --availability-zone $AZ1 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-public-1}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $PUBLIC_SUBNET_2_CIDR \
  --availability-zone $AZ2 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-public-2}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

# Create Private Subnets
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $PRIVATE_SUBNET_1_CIDR \
  --availability-zone $AZ1 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-private-1}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $PRIVATE_SUBNET_2_CIDR \
  --availability-zone $AZ2 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-private-2}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

# Create Data Subnets (for databases)
DATA_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $DATA_SUBNET_1_CIDR \
  --availability-zone $AZ1 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-data-1}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

DATA_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block $DATA_SUBNET_2_CIDR \
  --availability-zone $AZ2 \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=edusync-data-2}]" \
  --region $AWS_REGION \
  --query 'Subnet.SubnetId' \
  --output text)

echo "✅ Subnets created:"
echo "  Public:  $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
echo "  Private: $PRIVATE_SUBNET_1, $PRIVATE_SUBNET_2"
echo "  Data:    $DATA_SUBNET_1, $DATA_SUBNET_2"

# Create NAT Gateway (for private subnets to reach internet)
ALLOC_ID=$(aws ec2 allocate-address \
  --domain vpc \
  --region $AWS_REGION \
  --query 'AllocationId' \
  --output text)

NAT_GW=$(aws ec2 create-nat-gateway \
  --subnet-id $PUBLIC_SUBNET_1 \
  --allocation-id $ALLOC_ID \
  --tag-specifications "ResourceType=nat-gateway,Tags=[{Key=Name,Value=edusync-nat}]" \
  --region $AWS_REGION \
  --query 'NatGateway.NatGatewayId' \
  --output text)

echo "✅ NAT Gateway: $NAT_GW"

# Create Route Tables
PUBLIC_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=edusync-public-rt}]" \
  --region $AWS_REGION \
  --query 'RouteTable.RouteTableId' \
  --output text)

PRIVATE_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=edusync-private-rt}]" \
  --region $AWS_REGION \
  --query 'RouteTable.RouteTableId' \
  --output text)

# Add routes
aws ec2 create-route \
  --route-table-id $PUBLIC_RT \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $AWS_REGION

echo "⏳ Waiting for NAT Gateway to be available..."
aws ec2 wait nat-gateway-available \
  --nat-gateway-ids $NAT_GW \
  --region $AWS_REGION

aws ec2 create-route \
  --route-table-id $PRIVATE_RT \
  --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id $NAT_GW \
  --region $AWS_REGION

# Associate subnets with route tables
for subnet in $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2; do
  aws ec2 associate-route-table \
    --subnet-id $subnet \
    --route-table-id $PUBLIC_RT \
    --region $AWS_REGION
done

for subnet in $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2; do
  aws ec2 associate-route-table \
    --subnet-id $subnet \
    --route-table-id $PRIVATE_RT \
    --region $AWS_REGION
done

echo "✅ Route tables configured"

# Create Security Groups
SG_PUBLIC=$(aws ec2 create-security-group \
  --group-name edusync-public-sg \
  --description "Public SG for ALB" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

SG_PRIVATE=$(aws ec2 create-security-group \
  --group-name edusync-private-sg \
  --description "Private SG for ECS" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

SG_DATA=$(aws ec2 create-security-group \
  --group-name edusync-data-sg \
  --description "Data SG for RDS/DocumentDB/Redis" \
  --vpc-id $VPC_ID \
  --region $AWS_REGION \
  --query 'GroupId' \
  --output text)

# Ingress rules for ALB (allow HTTP/HTTPS)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_PUBLIC \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $SG_PUBLIC \
  --protocol tcp --port 443 --cidr 0.0.0.0/0 \
  --region $AWS_REGION

# ECS containers receive from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $SG_PRIVATE \
  --protocol tcp --port 3000 --source-group $SG_PUBLIC \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $SG_PRIVATE \
  --protocol tcp --port 3001 --source-group $SG_PUBLIC \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $SG_PRIVATE \
  --protocol tcp --port 3002 --source-group $SG_PUBLIC \
  --region $AWS_REGION

# Databases receive from ECS
aws ec2 authorize-security-group-ingress \
  --group-id $SG_DATA \
  --protocol tcp --port 5432 --source-group $SG_PRIVATE \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $SG_DATA \
  --protocol tcp --port 27017 --source-group $SG_PRIVATE \
  --region $AWS_REGION

aws ec2 authorize-security-group-ingress \
  --group-id $SG_DATA \
  --protocol tcp --port 6379 --source-group $SG_PRIVATE \
  --region $AWS_REGION

echo "✅ Security groups created and configured"

# Save configuration to file
cat > vpc-config.env << EOF
# VPC Configuration
VPC_ID=$VPC_ID
IGW_ID=$IGW_ID
NAT_GW=$NAT_GW

# Subnets
PUBLIC_SUBNET_1=$PUBLIC_SUBNET_1
PUBLIC_SUBNET_2=$PUBLIC_SUBNET_2
PRIVATE_SUBNET_1=$PRIVATE_SUBNET_1
PRIVATE_SUBNET_2=$PRIVATE_SUBNET_2
DATA_SUBNET_1=$DATA_SUBNET_1
DATA_SUBNET_2=$DATA_SUBNET_2

# Route Tables
PUBLIC_RT=$PUBLIC_RT
PRIVATE_RT=$PRIVATE_RT

# Security Groups
SG_PUBLIC=$SG_PUBLIC
SG_PRIVATE=$SG_PRIVATE
SG_DATA=$SG_DATA

# Region
AWS_REGION=$AWS_REGION
EOF

echo ""
echo "✅ VPC SETUP COMPLETE"
echo "📄 Configuration saved to: vpc-config.env"
echo ""
echo "Use in next scripts:"
echo "  source vpc-config.env"
