-- EduSync Mock Data Seed Script
-- THIS SCRIPT REQUIRES AT LEAST ONE REGISTERED USER.
-- Create an account via the UI first, then run this script in the Supabase SQL Editor.

DO $$
DECLARE
    v_user_id UUID;
    v_campus_id UUID;
BEGIN
    -- Get the first user and their campus
    SELECT id, campus_id INTO v_user_id, v_campus_id FROM profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found in profiles. Please complete the EduSync signup and onboarding first.';
        RETURN;
    END IF;

    -- 1. Insert 30+ Mock Skills (Assigned to the first user or other mock data could be generated similarly)
    INSERT INTO skills (mentor_id, title, description, category, tags, karma_cost, is_nexus, campus_id, avg_rating, total_reviews) VALUES
    (v_user_id, 'Advanced React Architecture', 'Learn how to build scalable React applications using modern patterns.', 'Tech', '{"react", "architecture", "frontend"}', 50, true, v_campus_id, 4.8, 24),
    (v_user_id, 'VLSI Design Fundamentals', 'Comprehensive introduction to Very Large Scale Integration.', 'Engineering', '{"vlsi", "electronics", "hardware"}', 60, false, v_campus_id, 4.5, 12),
    (v_user_id, 'UX/UI Wireframing in Figma', 'Master the art of creating low and high fidelity wireframes.', 'Design', '{"figma", "ux", "ui"}', 30, true, v_campus_id, 4.9, 45),
    (v_user_id, 'Data Structures in C++', 'Deep dive into arrays, linked lists, trees, and graphs.', 'Engineering', '{"cpp", "dsa", "programming"}', 75, true, v_campus_id, 4.7, 88),
    (v_user_id, 'Business Strategy for Startups', 'How to write a business plan and secure seed funding.', 'Business', '{"startups", "strategy", "funding"}', 40, true, v_campus_id, 4.2, 10),
    (v_user_id, 'Thermodynamics Problem Solving', 'Step by step approach to solving complex thermo problems.', 'Science', '{"physics", "engineering", "thermo"}', 35, false, v_campus_id, 4.6, 18),
    (v_user_id, 'Marketing Analytics', 'Using data to drive marketing campaigns.', 'Business', '{"marketing", "data", "analytics"}', 45, true, v_campus_id, 4.4, 30),
    (v_user_id, 'Machine Learning Basics', 'Introduction to supervised and unsupervised learning.', 'Tech', '{"ml", "ai", "python"}', 80, true, v_campus_id, 4.9, 110),
    (v_user_id, 'Digital Logic gates', 'Understanding XOR, AND, OR, and complex circuits.', 'Engineering', '{"digital logic", "hardware"}', 30, false, v_campus_id, 4.1, 8),
    (v_user_id, 'Creative Writing Workshop', 'A peer-review format for creative fiction.', 'Writing', '{"fiction", "creative", "writing"}', 20, true, v_campus_id, 5.0, 5),
    (v_user_id, 'Spanish for Beginners', 'Basic conversational Spanish skills.', 'Languages', '{"spanish", "languages"}', 25, true, v_campus_id, 4.3, 14),
    (v_user_id, 'Quantum Computing Concepts', 'Theoretical background to quantum bits.', 'Science', '{"physics", "quantum"}', 90, true, v_campus_id, 4.8, 40),
    (v_user_id, 'Public Speaking Mastery', 'Tech talk preparation and delivery.', 'Arts', '{"speaking", "presentation"}', 40, true, v_campus_id, 4.7, 22),
    (v_user_id, 'Cloud Deployment with AWS', 'Deploying static and dynamic sites to AWS.', 'Tech', '{"aws", "cloud", "devops"}', 60, true, v_campus_id, 4.6, 55),
    (v_user_id, 'Logo Design Basics', 'Vector graphics and branding rules.', 'Design', '{"design", "illustrator"}', 35, false, v_campus_id, 4.4, 16);

    -- 2. Insert 15+ Mock Resources (The Vault)
    INSERT INTO resources (uploader_id, campus_id, title, subject, type, url, karma_cost, is_verified, status, download_count) VALUES
    (v_user_id, v_campus_id, 'Complete DSA Cheat Sheet', 'Algorithms', 'PDF', 'https://example.com/dsa.pdf', 15, true, 'approved', 340),
    (v_user_id, v_campus_id, 'React Hooks Video Guide', 'Web Dev', 'Video', 'https://example.com/react.mp4', 25, true, 'approved', 120),
    (v_user_id, v_campus_id, 'Thermodynamics Past Paper 2023', 'Science', 'PDF', 'https://example.com/thermo.pdf', 10, true, 'approved', 89),
    (v_user_id, v_campus_id, 'Machine Learning Glossary', 'AI', 'Doc', 'https://example.com/ml-glossary.doc', 20, true, 'approved', 200),
    (v_user_id, v_campus_id, 'VLSI Formula Sheet', 'Engineering', 'PDF', 'https://example.com/vlsi.pdf', 10, false, 'pending', 0),
    (v_user_id, v_campus_id, 'Figma Shortcuts Poster', 'Design', 'PDF', 'https://example.com/figma-poster.pdf', 5, true, 'approved', 500),
    (v_user_id, v_campus_id, 'Business Econ Notes', 'Business', 'Doc', 'https://example.com/econ.doc', 30, true, 'approved', 45),
    (v_user_id, v_campus_id, 'Spanish Verb Conjugation Chart', 'Languages', 'PDF', 'https://example.com/spanish.pdf', 10, true, 'approved', 12),
    (v_user_id, v_campus_id, 'Introduction to AWS (Slides)', 'Tech', 'PDF', 'https://example.com/aws-slides.pdf', 25, true, 'approved', 190),
    (v_user_id, v_campus_id, 'Creative Writing Prompts', 'Writing', 'Doc', 'https://example.com/prompts.doc', 10, true, 'approved', 77);

    RAISE NOTICE 'Mock data successfully seeded to EduSync Database.';
END $$;
