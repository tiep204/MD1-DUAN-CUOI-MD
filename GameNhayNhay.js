let canvas = document.querySelector('canvas'); // Lấy thẻ canvas
let ctx = canvas.getContext('2d'); // Lấy context 2d
let game = {}; // Object này để chứa dữ liệu game
function chu(x, y, style, align, content) {
    ctx.textAlign = align;
    ctx.font = style;
    ctx.fillText(content, x, y);
}

function createImg(src) {
    const image = new Image();
    image.src = src;
    return image;
}

//////chỉnh kích thước của màn hình theo từng máy khác nhau////
function resizeCanvas() {
    if ((window.innerWidth / window.innerHeight) >= (1280 / 720)) {
        canvas.style.width = "";
        canvas.style.height = "100%";
    } else {
        canvas.style.width = "100%";
        canvas.style.height = "";
    }
}

//////// KHOI TAO KHUNG LONG////
function Player(img, x, y, w, h) {
    this.img = createImg(img); // Ảnh của vật thể
    this.x = x; // Tọa độ x
    this.y = y; // Tọa độ y
    this.w = w; // Chiều rộng
    this.h = h; // Chiều cao
    this.maxDoNhay = 500; // Độ cao nhảy tối đa
    this.DoNhay = "None"; //Trạng thái nhảy
    this.update = () => {
        // Nếu trạng thái nhảy là up thì tăng tọa độ y
        if (this.DoNhay === "Up") {
            this.y += 10;
            if (this.y >= this.maxDoNhay) {
                this.y = this.maxDoNhay;
                this.DoNhay = "Down";
            }
        }
        // Nếu trạng thái nhảy là down thì giảm tọa độ y
        if (this.DoNhay === "Down") {
            this.y -= 20;
            if (this.y <= 10) {
                this.y = 0
                this.DoNhay = "None";
            }
        }
        // Vẽ ảnh trên canvas
        ctx.drawImage(this.img, this.x, 720 - this.y - this.h, this.w, this.h);
    }
}

////////các chướng ngại vật/////
function Obstacle(img, x, y, w, h) {
    this.img = createImg(img);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.active = true;
    this.update = () => {
        if (!this.active)
            return;
        // Chướng ngại vật sẽ di chuyển từ phải qua trái
        this.x -= 10;
        if (this.x <= -this.w) {
            this.active = false;
        }
        if (game.score > 200) {
            this.x -= 10
        }
        if (game.score > 500) {
            this.x -= 10.1
        }
        if (game.score > 1000) {
            this.x -= 12
        }
        if (game.score > 2000) {
            this.x -= 20
        }
        if (game.score > 10000) {
            // chu(1280 / 2, 720 / 2, "50px red", "center", "ban da chien thang",);
            // document.getElementById('play-again').style.display = "inline-block";
            alert('ban da chien thang')
        }
        ctx.drawImage(this.img, this.x, 720 + this.y - this.h, this.w, this.h);
    }
}

// function reLoad(){
//     window.location.reload()
//
// }

let amThanh = new Audio("./audio/teoteoteo.mp3");

function initGame() {
    amThanh.play();
    // Ẩn nút chơi lại
    document.getElementById('play-again').style.display = "None";
    game.score = 0;
    game.startTime = new Date().getTime();
    // Tạo Player
    game.khungLong = new Player('anh/anhkhunglong.jpg', 100, 0, 100, 100);
    // Danh sách các chướng ngại vật
    game.DuLieuGame = [];
    // Mốc thời gian tạo chướng ngại vật tiếp theo
    game.nextObstacleTmp = new Date().getTime() + Math.floor(Math.random() * 2000) + 1000;
    // Xử lý sự kiên khi ấn phím cách thì nhảy lên
    window.onkeyup = function (e) {
        if (e.keyCode == 32) {
            if (game.khungLong.DoNhay == "None")
                game.khungLong.DoNhay = "Up";
        }
    }
    gameLoop();
}

initGame();

function gameLoop() {
    resizeCanvas();
    // Xóa frame cũ
    ctx.clearRect(0, 0, 1280, 720);
    // Cập nhật điểm
    updateScore();
    // Tạo chướng ngại vật mới
    genObstacle();
    // Cập nhật vị trí khủng long
    game.khungLong.update();
    // Cập nhật vị trí các chướng ngại vật
    for (let i = 0; i < game.DuLieuGame.length; i++) {
        game.DuLieuGame[i].update();
        // Kiểm tra va chạm với khủng long, nếu va chạm thì game kết thúc
        if (checkVaCham(game.DuLieuGame[i], game.khungLong)) {
            chu(1280 / 2, 720 / 2, "40px Arial", "center", "Bạn Đã thua Cuộc",);
            let amNhac = new Audio("./audio/thiramchoncaichet.mp3")
            amNhac.play()
            amThanh.pause();
            document.getElementById('play-again').style.display = "inline-block";
            return window.cancelAnimationFrame(gameLoop);
        }
    }
    window.requestAnimationFrame(gameLoop);
}

////////TẠO CHƯỚNG NGẠI VẬT MỚI////////
function genObstacle() {
    // Nếu chưa đến thời gian tạo chướng ngại vật mới thì return luôn
    if (game.nextObstacleTmp > new Date().getTime()) return;
    // Tạo sỗ ngẫu nhiên 0 hoặc 1
    const randomNum = Math.floor(Math.random() * 2);
    // Nếu số là 0 thì tạo pokeball
    if (randomNum == 0) {
        const newDuLieuGame = new Obstacle('anh/conchim.jpg', 1280, 200, 105, 150);
        game.DuLieuGame.push(newDuLieuGame);
    } else {
        // Nếu không thì tạo con Nyasu là Nyasu
        const newDuLieuGame = new Obstacle('anh/suongrong2.jpg', 1280, 0, 200, 100);
        game.DuLieuGame.push(newDuLieuGame);
    }
    // Cập nhật thời gian sinh chướng ngại vật tiếp theo
    game.nextObstacleTmp = new Date().getTime() + Math.floor(Math.random() * 2000) + 1000;
}

////////CẬP NHẬT ĐIỂM////////
function updateScore() {
    game.score = Math.floor((new Date().getTime() - game.startTime) / 100);
    chu(1280 - 50, 50, "28px Arial", "right", `Score: ${game.score}`);
}

function checkVaCham(anh1, anh2) {
    if (anh1.x > anh2.x + anh2.w
        || anh1.x + anh1.w < anh2.x
        || anh1.y > anh2.y + anh2.h
        || anh1.y + anh1.h < anh2.y) {
        return false;
    } else {
        return true;
    }
}