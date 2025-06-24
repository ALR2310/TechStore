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