-- Bảng người dùng
CREATE TABLE IF NOT EXISTS User (
    Id INTEGER PRIMARY KEY,
    GoogleId TEXT UNIQUE,
    FacebookId TEXT UNIQUE,
    Email TEXT UNIQUE,
    UserName TEXT UNIQUE,
    Password TEXT,
    Role TEXT CHECK (Role IN ('User', 'Admin')) DEFAULT 'User',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết người dùng
CREATE TABLE IF NOT EXISTS UserInfo (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User (Id),
    FullName TEXT,
    PhoneNumber TEXT,
    Gender TEXT CHECK (Gender IN ('Nam', 'Nữ')) DEFAULT 'Nam',
    DoB TEXT DEFAULT '0001-01-01 00:00:00',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng địa chỉ nhận hàng
CREATE TABLE IF NOT EXISTS Address (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User (Id),
    FullName TEXT,
    PhoneNumber TEXT,
    AddressLine TEXT,
    AddressType TEXT CHECK (
        AddressType IN ('Văn phòng', 'Nhà riêng')
    ) DEFAULT 'Nhà riêng',
    Country TEXT DEFAULT "Việt Nam",
    IsDefault INTEGER CHECK (IsDefault IN (0, 1)) DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng mã xác thực người dùng
CREATE TABLE IF NOT EXISTS AuthToken (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User (Id),
    Token TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh mục sản phẩm
CREATE TABLE IF NOT EXISTS Categories (
    Id INTEGER PRIMARY KEY,
    CateName TEXT UNIQUE,
    Slugs TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thương hiệu sản phẩm
CREATE TABLE IF NOT EXISTS Brands (
    Id INTEGER PRIMARY KEY,
    BrandName TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng loạt thương hiệu
CREATE TABLE IF NOT EXISTS BrandSeries (
    Id INTEGER PRIMARY KEY,
    BrandId INTEGER REFERENCES Brands (Id),
    SeriesName TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm
CREATE TABLE IF NOT EXISTS Product (
    Id INTEGER PRIMARY KEY,
    CateId INTEGER REFERENCES Categories (Id),
    BrandId INTEGER REFERENCES Brands (Id),
    BrandSeriesId INTEGER REFERENCES BrandSeries (Id),
    Image TEXT,
    ProdName TEXT UNIQUE,
    Quantity INTEGER DEFAULT 1,
    Price REAL,
    Discount REAL DEFAULT 0,
    Slugs TEXT UNIQUE,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết sản phẩm
CREATE TABLE IF NOT EXISTS ProductDetails (
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product (Id),
    DeviceCfg TEXT,
    Content TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đánh giá sản phẩm
CREATE TABLE IF NOT EXISTS ProductReviews (
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product (Id),
    UserId INTEGER REFERENCES User (Id),
    UserName TEXT,
    Rating INTEGER CHECK (
        Rating >= 1
        AND Rating <= 5
    ),
    Comment TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sản phẩm đã xem
CREATE TABLE IF NOT EXISTS ProductViewed (
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product (Id),
    UserId INTEGER REFERENCES User (Id),
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng các nhãn sản phẩm
CREATE TABLE IF NOT EXISTS Tags (
    Id INTEGER PRIMARY KEY,
    ProdId INTEGER REFERENCES Product (Id),
    TagName TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng giỏ hàng
CREATE TABLE IF NOT EXISTS Cart (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User (Id),
    ProdId INTEGER REFERENCES Product (Id),
    Quantity INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phương thức thanh toán
CREATE TABLE IF NOT EXISTS Payments (
    Id INTEGER PRIMARY KEY,
    PayName TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đơn vị vận chuyển
CREATE TABLE IF NOT EXISTS Shipment (
    Id INTEGER PRIMARY KEY,
    ShipName TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng đơn hàng
CREATE TABLE IF NOT EXISTS Orders (
    Id INTEGER PRIMARY KEY,
    Code TEXT UNIQUE,
    UserId INTEGER REFERENCES User (Id),
    AdrId INTEGER REFERENCES Address (Id),
    TotalPrice REAL DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN (
            'Processing',
            'Delivering',
            'Completed',
            'Cancelled'
        )
    ) DEFAULT 'Processing',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết đơn hàng
CREATE TABLE IF NOT EXISTS OrderItems (
    Id INTEGER PRIMARY KEY,
    OrdId INTEGER REFERENCES Orders (Id),
    ProdId INTEGER REFERENCES Product (Id),
    Quantity INT DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch sử mua hàng
CREATE TABLE IF NOT EXISTS PurchaseHistory (
    Id INTEGER PRIMARY KEY,
    UserId INTEGER REFERENCES User (Id),
    ProdId INTEGER REFERENCES Product (Id),
    Quantity INTEGER DEFAULT 1,
    TotalPrice REAL DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    Status TEXT CHECK (
        Status IN ('Active', 'Inactive')
    ) DEFAULT 'Active',
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trigger để đảm bảo chỉ có một địa chỉ mặc định cho mỗi User của bảng Address
CREATE TRIGGER set_default_address
BEFORE INSERT ON Address
FOR EACH ROW
WHEN NEW.IsDefault = 1
BEGIN
    UPDATE Address 
    SET IsDefault = 0 
    WHERE UserId = NEW.UserId;
END;

-- Trigger để cập nhật địa chỉ khác khi IsDefault thay đổi của bảng Address
CREATE TRIGGER update_default_address
BEFORE UPDATE ON Address
FOR EACH ROW
WHEN NEW.IsDefault = 1 AND OLD.IsDefault != NEW.IsDefault
BEGIN
    UPDATE Address 
    SET IsDefault = 0 
    WHERE UserId = NEW.UserId AND Id != NEW.Id;
END;

-- Dữ liệu
INSERT INTO
    User (
        Email,
        UserName,
        Password,
        Role
    )
VALUES (
        'anle@gmail.com',
        'anle',
        '$2a$10$weMkH.qB0S.Nv1Jih.3tTuSmtilJwNGs4GtyMN6rom5rj7.UcezXa',
        'Admin'
    );

INSERT INTO UserInfo (UserId, FullName) VALUES (1, 'Thanh An');

INSERT INTO Categories (CateName, Slugs) VALUES ('Laptop', 'laptop');

INSERT INTO
    Categories (CateName, Slugs)
VALUES (
        'Laptop Gaming',
        'laptop-gaming'
    );

INSERT INTO Categories (CateName, Slugs) VALUES ('PC', 'pc');

INSERT INTO
    Categories (CateName, Slugs)
VALUES ('PC Gaming', 'pc-gaming');

INSERT INTO Brands (BrandName) VALUES ('Apple');

INSERT INTO Brands (BrandName) VALUES ('Asus');

INSERT INTO Brands (BrandName) VALUES ('Acer');

INSERT INTO Brands (BrandName) VALUES ('MSI');

INSERT INTO Brands (BrandName) VALUES ('Lenovo');

INSERT INTO Brands (BrandName) VALUES ('Dell');

INSERT INTO Brands (BrandName) VALUES ('HP');

INSERT INTO Brands (BrandName) VALUES ('Gigabyte');

INSERT INTO Brands (BrandName) VALUES ('LG');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (2, 'VivoBook');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (2, 'ZenBook');

INSERT INTO
    BrandSeries (BrandId, SeriesName)
VALUES (2, 'Tuf Gaming');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (2, 'ROG');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (3, 'Swift');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (3, 'Nitro');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (3, 'Aspire');

INSERT INTO
    BrandSeries (BrandId, SeriesName)
VALUES (3, 'Aspire Gaming');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (4, 'Modern');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (4, 'Prestige');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (4, 'Summit');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (5, 'ThinkBook');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (5, 'IdeaPad');

INSERT INTO
    BrandSeries (BrandId, SeriesName)
VALUES (5, 'IdeaPad Pro');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (5, 'ThinkPad');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (5, 'Yoga');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (6, 'Vostro');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (6, 'Inspiron');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (6, 'XPS');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (6, 'Latitude');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (7, 'Victus');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (7, 'Pavilion');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (7, 'ProBook');

INSERT INTO BrandSeries (BrandId, SeriesName) VALUES (7, 'Envy');

-- example data
INSERT INTO
    User (
        Id,
        Email,
        UserName,
        Password,
        Role,
        createdAt,
        Status
    )
VALUES (
        4,
        'nguyenvanan@example.com',
        'nguyen.anan',
        'password123',
        'User',
        '2023-05-12 14:23:45',
        'Active'
    ),
    (
        5,
        'tranthiminh@example.com',
        'tran.minh',
        'password123',
        'User',
        '2023-04-08 09:15:32',
        'Active'
    ),
    (
        6,
        'lethanhhai@example.com',
        'le.hai',
        'password123',
        'Admin',
        '2023-03-17 17:50:11',
        'Active'
    ),
    (
        7,
        'phamvanhoa@example.com',
        'pham.hoa',
        'password123',
        'User',
        '2023-02-22 20:35:27',
        'Inactive'
    ),
    (
        8,
        'nguyenvanbinh@example.com',
        'nguyen.binh',
        'password123',
        'User',
        '2023-01-30 08:45:59',
        'Active'
    ),
    (
        9,
        'dangthimai@example.com',
        'dang.mai',
        'password123',
        'User',
        '2022-12-11 13:22:14',
        'Active'
    ),
    (
        10,
        'hoangvanchien@example.com',
        'hoang.chien',
        'password123',
        'User',
        '2022-11-05 15:10:33',
        'Active'
    ),
    (
        11,
        'lethiminh@example.com',
        'le.minh',
        'password123',
        'User',
        '2022-10-23 07:55:21',
        'Inactive'
    ),
    (
        12,
        'trankhanhlinh@example.com',
        'tran.linh',
        'password123',
        'User',
        '2022-09-14 12:40:17',
        'Active'
    ),
    (
        13,
        'phamthithao@example.com',
        'pham.thao',
        'password123',
        'User',
        '2022-08-28 18:29:44',
        'Active'
    ),
    (
        14,
        'nguyenvanhoa@example.com',
        'nguyen.hoa',
        'password123',
        'User',
        '2022-07-09 22:18:35',
        'Active'
    ),
    (
        15,
        'lethanhbinh@example.com',
        'le.binh',
        'password123',
        'User',
        '2022-06-21 10:05:56',
        'Active'
    ),
    (
        16,
        'nguyenminhtrang@example.com',
        'nguyen.trang',
        'password123',
        'Admin',
        '2022-05-15 19:50:42',
        'Active'
    ),
    (
        17,
        'phamngocanh@example.com',
        'pham.anh',
        'password123',
        'User',
        '2022-04-30 14:20:18',
        'Inactive'
    ),
    (
        18,
        'tranvanhieu@example.com',
        'tran.hieu',
        'password123',
        'User',
        '2022-03-27 11:33:10',
        'Active'
    ),
    (
        19,
        'dovanhung@example.com',
        'do.hung',
        'password123',
        'User',
        '2022-02-18 16:45:09',
        'Active'
    ),
    (
        20,
        'hoangthithu@example.com',
        'hoang.thu',
        'password123',
        'User',
        '2022-01-07 08:55:30',
        'Active'
    );

INSERT INTO
    UserInfo (
        Id,
        UserId,
        FullName,
        PhoneNumber,
        Gender,
        DoB,
        createdAt
    )
VALUES (
        4,
        4,
        'Nguyễn Văn An',
        '0987123456',
        'Nam',
        '1995-06-12 00:00:00',
        '2023-05-12 14:23:45'
    ),
    (
        5,
        5,
        'Trần Thị Minh',
        '0978123456',
        'Nữ',
        '1998-07-23 00:00:00',
        '2023-04-08 09:15:32'
    ),
    (
        6,
        6,
        'Lê Thanh Hải',
        '0967123456',
        'Nam',
        '1990-01-15 00:00:00',
        '2023-03-17 17:50:11'
    ),
    (
        7,
        7,
        'Phạm Văn Hòa',
        '0956123456',
        'Nam',
        '1993-03-22 00:00:00',
        '2023-02-22 20:35:27'
    ),
    (
        8,
        8,
        'Nguyễn Văn Bình',
        '0945123456',
        'Nam',
        '1989-12-01 00:00:00',
        '2023-01-30 08:45:59'
    ),
    (
        9,
        9,
        'Đặng Thị Mai',
        '0934123456',
        'Nữ',
        '1997-05-10 00:00:00',
        '2022-12-11 13:22:14'
    ),
    (
        10,
        10,
        'Hoàng Văn Chiến',
        '0923123456',
        'Nam',
        '1992-11-30 00:00:00',
        '2022-11-05 15:10:33'
    ),
    (
        11,
        11,
        'Lê Thị Minh',
        '0912123456',
        'Nữ',
        '2000-08-19 00:00:00',
        '2022-10-23 07:55:21'
    ),
    (
        12,
        12,
        'Trần Khánh Linh',
        '0901123456',
        'Nữ',
        '2002-04-25 00:00:00',
        '2022-09-14 12:40:17'
    ),
    (
        13,
        13,
        'Phạm Thị Thảo',
        '0981234567',
        'Nữ',
        '1996-10-05 00:00:00',
        '2022-08-28 18:29:44'
    ),
    (
        14,
        14,
        'Nguyễn Văn Hòa',
        '0971234567',
        'Nam',
        '1987-09-12 00:00:00',
        '2022-07-09 22:18:35'
    ),
    (
        15,
        15,
        'Lê Thanh Bình',
        '0961234567',
        'Nam',
        '1991-02-28 00:00:00',
        '2022-06-21 10:05:56'
    ),
    (
        16,
        16,
        'Nguyễn Minh Trang',
        '0951234567',
        'Nữ',
        '2001-07-07 00:00:00',
        '2022-05-15 19:50:42'
    ),
    (
        17,
        17,
        'Phạm Ngọc Anh',
        '0941234567',
        'Nữ',
        '1994-06-15 00:00:00',
        '2022-04-30 14:20:18'
    ),
    (
        18,
        18,
        'Trần Văn Hiếu',
        '0931234567',
        'Nam',
        '1993-03-09 00:00:00',
        '2022-03-27 11:33:10'
    ),
    (
        19,
        19,
        'Đỗ Văn Hùng',
        '0921234567',
        'Nam',
        '1990-11-11 00:00:00',
        '2022-02-18 16:45:09'
    ),
    (
        20,
        20,
        'Hoàng Thị Thu',
        '0911234567',
        'Nữ',
        '1999-12-20 00:00:00',
        '2022-01-07 08:55:30'
    );