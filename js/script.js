const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MY_PLAYER'; 

const player =  $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play ');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isTimeUpdating: true,
    isRandom:  false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Ai",
            singer: "DSK",
            path: "././assets/music/Ai.mp3",
            image: "././assets/img/dsk.jpg"
        },
        {
            name: "Âm thầm bên em",
            singer: "Sơn Tùng-MTP",
            path: "././assets/music/AmThamBenEm.mp3",
            image:
              "././assets/img/son-tung-mtp.jpg"
        },
        {
            name: "Chưa bao giờ",
            singer: "DSK",
            path: "././assets/music/ChuaBaoGio.mp3",
            image:
              "././assets/img/dsk.jpg"
        },
        {
            name: "Chúng ta của hiện tại",
            singer: "Sơn Tùng-MTP",
            path: "././assets/music/ChungTaCuaHienTai.mp3",
            image:
              "././assets/img/son-tung-mtp.jpg"
        },
        {
            name: "Đôi bờ",
            singer: "KraziNoyze ft. BlakRay, DSK",
            path: "././assets/music/DoiBo.mp3",
            image:
              "././assets/img/dsk.jpg"
        },
        {
            name: "Không thể cùng nhau suốt kiếp",
            singer: "Hòa Minzy Ft Mr.Siro",
            path: "././assets/music/KhongTheCungNhauSuotKiep.mp3",
            image:
              "././assets/img/hoa-minzy.jpg"
        },
        {
            name: "Lớn rồi",
            singer: "DSK",
            path: "././assets/music/LonRoi.mp3",
            image:
              "././assets/img/dsk.jpg"
        },
        {
            name: "Một bước yêu vạn dặm đau",
            singer: "Mr.Siro",
            path: "././assets/music/MotBuocYeuVanDamDau.mp3",
            image:
              "././assets/img/mr-siro.jpg"
        },
        {
            name: "Thương em là điều anh không thể ngờ",
            singer: "Noo Phước Thịnh",
            path: "././assets/music/ThuongEmLaDieuAnhKhongTheNgo.mp3",
            image:
              "././assets/img/noo-phuoc-thinh.jpg"
        },
    ],
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));

    },
    render: function(){
        var html = this.songs.map((song, index) => {
            return `
                        <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index ="${index}">
                            <div class="thumb" style="background-image: url(${song.image})">
                            </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                     `;
        });

         //document.querySelector('.playlist').innerHTML = html.join('');
         playlist.innerHTML = html.join('');
        
    },
    defineProperties: function(){
        Object.defineProperty(this,'currentSong',{
            get(){
                return this.songs[this.currentIndex];
            }
        });

    },
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lí CD quay tròn /  dừng
       const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000, // 10 seconds
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Xử lí phóng to / thủ nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.screenTop || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lí khi click nút play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        // Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi nút progress chạy theo
        audio.ontimeupdate = function(){
            //if(_this.isTimeUpdating){
                if(audio.duration){
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
           // }
            
        }

        // Xử lý khi tua bài hát
        progress.onchange = function(e){
           const seekTime = audio.duration / 100 * Number(e.target.value);
           audio.currentTime = seekTime;
           _this.isTimeUpdating = true;
        }

        // Khi prev bài hát
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi next bài hát
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.randomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active',_this.isRandom);
        }

        // Xử lý lặp lại 1 bài hất
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active',_this.repeatBtn);
        }

        // Xử lí next bài hát khi audio ended 
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist 
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option') ){
                
                // Xử lý khi click vào bài hát
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }

                // Xử lý khi click vào bài hát option
                if(e.target.closest('.option')){

                }

            }
        }
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    loadCurrentSong: function(){
       
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

        //console.log(heading,cdThumb,audio);
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: this.currentIndex < 3 ? 'end' : 'center',
            })
        },300);
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    randomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(this.currentIndex === newIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe và xử kí các sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vài UI (User Interface) khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat && random
        randomBtn.classList.toggle('active',this.isRandom);
        repeatBtn.classList.toggle('active',this.isRepeat);

    },
    
}

app.start();
