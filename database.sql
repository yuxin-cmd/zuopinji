-- 在 Supabase SQL Editor 中运行此文件

-- 1. 文本内容表
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 视频表
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('brand', 'operation', 'event')),
  bilibili_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 关于我图片表
CREATE TABLE about_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 存储桶（在 Storage 页面手动创建，名称为 about-images，设为公开）

-- 5. 初始数据
INSERT INTO site_content (section_key, content) VALUES
  ('intro_name', '你的姓名'),
  ('intro_title', '你的头衔'),
  ('intro_bio', '简短的个人介绍'),
  ('about_text', '工作之外的成果介绍'),
  ('contact_wechat', '你的微信号'),
  ('contact_email', 'your@email.com');

-- 6. RLS 策略：公开读取
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_images ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read about_images" ON about_images FOR SELECT USING (true);

-- 只有认证用户可以写入
CREATE POLICY "Auth insert site_content" ON site_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update site_content" ON site_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete site_content" ON site_content FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert videos" ON videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update videos" ON videos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete videos" ON videos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert about_images" ON about_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update about_images" ON about_images FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete about_images" ON about_images FOR DELETE USING (auth.role() = 'authenticated');
