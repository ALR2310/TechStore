CREATE DATABASE IF NOT EXISTS TechStore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE TechStore;

-- Bảng người dùng
CREATE TABLE User(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    GoogleId VARCHAR(100),
    FacebookId VARCHAR(100),
    Email VARCHAR(50),
    UserName VARCHAR(50),
    Password VARCHAR(100),
    Role ENUM('User', 'Admin') DEFAULT 'User',
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng chi tiết người dùng
CREATE TABLE UserInfo(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT REFERENCES User(Id),
    FullName VARCHAR(100),
    PhoneNumber VARCHAR(15),
    Gender VARCHAR(5) DEFAULT "Name",
    DoB DATETIME,
    Address VARCHAR(100),
    Country VARCHAR(50) DEFAULT "Việt Nam",
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng mã xác thực người dùng
CREATE TABLE AuthToken(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT REFERENCES User(Id),
    Token CHAR(64),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh mục sản phẩm
CREATE TABLE Categories(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CateName VARCHAR(50),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng thương hiệu sản phẩm
CREATE TABLE Brands(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BrandName VARCHAR(50),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng loạt thương hiệu
CREATE TABLE BrandSeries(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BrandId INT REFERENCES Brands(Id),
    SeriesName VARCHAR(50),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng sản phẩm
CREATE TABLE Product(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CateId INT REFERENCES Categories(Id),
    BrandId INT REFERENCES Brands(Id),
    BrandSeriesId INT REFERENCES BrandSeries(Id),
    Image VARCHAR(200),
    ProdName VARCHAR(100),
    Quantity INT DEFAULT 1,
    Price DECIMAL(12,2) DEFAULT 0.00,
    Discount DECIMAL(5,2) DEFAULT 0.00,
    Slugs VARCHAR(200),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    AtUpdate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng chi tiết sản phẩm
CREATE TABLE ProductDetails(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProdId INT REFERENCES Product(Id),
    DeviceCfg TEXT,
    Content TEXT,
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    AtUpdate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đánh giá sản phẩm
CREATE TABLE ProductReviews(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProdId INT REFERENCES Product(Id),
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    Comment VARCHAR(500),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Bảng các nhãn sản phẩm
CREATE TABLE Tag(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProdId INT REFERENCES Product(Id),
    TagName VARCHAR(50),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active' 
);

-- Bảng giỏ hàng
CREATE TABLE Cart(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT REFERENCES User(Id),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Bảng chi tiết giỏ hàng
CREATE TABLE CartItem(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CardId INT REFERENCES Cart(Id),
    ProdId INT REFERENCES Product(Id),
    Quantity INT DEFAULT 1,
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phương thức thanh toán
CREATE TABLE Payments(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    PayName VARCHAR(50),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Bảng đơn vị vận chuyển
CREATE TABLE Shipment(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ShipName VARCHAR(200),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Bảng đơn hàng
CREATE TABLE Orders(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT REFERENCES User(Id),
    PayId INT REFERENCES Payments(Id),
    ShipId INT REFERENCES Shipment(Id),
    TotalPrice DECIMAL(12,2),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Processing', 'Completed', 'Cancelled') DEFAULT 'Pending'
);

-- Bảng chi tiết đơn hàng
CREATE TABLE OrderItems(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    OrdId INT REFERENCES Orders(Id),
    ProdId INT REFERENCES Product(Id),
    Quantity INT DEFAULT 1,
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử mua hàng
CREATE TABLE PurchaseHistory(
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT REFERENCES User(Id),
    ProdId INT REFERENCES Product(Id),
    Quantity INT DEFAULT 1,
    TotalPrice DECIMAL(12,2),
    AtCreate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active'
);

-- Dữ liệu 
INSERT INTO User(Email, UserName, Password, Role) VALUE ('anle@gmail.com', 'anle', '$2a$10$weMkH.qB0S.Nv1Jih.3tTuSmtilJwNGs4GtyMN6rom5rj7.UcezXa', 'Admin');
INSERT INTO UserInfo(UserId, FullName) VALUE(1, 'Thanh An');

INSERT INTO Categories(CateName) VALUE('Laptop');
INSERT INTO Categories(CateName) VALUE('Laptop Gaming');
INSERT INTO Categories(CateName) VALUE('PC');
INSERT INTO Categories(CateName) VALUE('PC Gaming');

INSERT INTO Brands(BrandName) VALUE('Asus');
INSERT INTO Brands(BrandName) VALUE('Acer');
INSERT INTO Brands(BrandName) VALUE('MSI');
INSERT INTO Brands(BrandName) VALUE('Lenovo');
INSERT INTO Brands(BrandName) VALUE('Dell');
INSERT INTO Brands(BrandName) VALUE('HP');
INSERT INTO Brands(BrandName) VALUE('LG');

INSERT INTO BrandSeries(BrandId, SeriesName) VALUE (1, 'VivoBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUE (1, 'ZenBook');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUE (1, 'Tuf Gaming');
INSERT INTO BrandSeries(BrandId, SeriesName) VALUE (1, 'ROG');