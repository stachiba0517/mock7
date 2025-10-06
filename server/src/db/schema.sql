-- 補助金データベーススキーマ (Aurora Serverless MySQL)

-- データベース作成
CREATE DATABASE IF NOT EXISTS subsidy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE subsidy_db;

-- 補助金テーブル
CREATE TABLE IF NOT EXISTS subsidies (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATETIME,
  status ENUM('active', 'expired', 'upcoming') NOT NULL DEFAULT 'active',
  amount_min DECIMAL(15, 2),
  amount_max DECIMAL(15, 2),
  amount_rate VARCHAR(50),
  prefecture VARCHAR(50) NOT NULL,
  url TEXT,
  source VARCHAR(255),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_prefecture (prefecture),
  INDEX idx_deadline (deadline),
  INDEX idx_organization (organization),
  FULLTEXT INDEX idx_fulltext (title, description, organization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 補助金カテゴリテーブル
CREATE TABLE IF NOT EXISTS subsidy_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subsidy_id VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  FOREIGN KEY (subsidy_id) REFERENCES subsidies(id) ON DELETE CASCADE,
  INDEX idx_subsidy_id (subsidy_id),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 補助金対象者・要件テーブル
CREATE TABLE IF NOT EXISTS subsidy_eligibility (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subsidy_id VARCHAR(50) NOT NULL,
  eligibility_text TEXT NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (subsidy_id) REFERENCES subsidies(id) ON DELETE CASCADE,
  INDEX idx_subsidy_id (subsidy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- アクセスログテーブル（オプション）
CREATE TABLE IF NOT EXISTS access_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subsidy_id VARCHAR(50),
  action VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subsidy_id (subsidy_id),
  INDEX idx_accessed_at (accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 検索履歴テーブル（オプション）
CREATE TABLE IF NOT EXISTS search_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  search_keyword VARCHAR(255),
  status VARCHAR(20),
  category VARCHAR(100),
  prefecture VARCHAR(50),
  results_count INT,
  searched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_keyword (search_keyword),
  INDEX idx_searched_at (searched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

