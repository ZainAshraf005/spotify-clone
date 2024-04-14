
console.log('lets write some JavaScript');

let currentSong = new Audio();
let songs;
let currFolder;

function timeChange(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    let a = await fetch(`/${folder}/`);
    currFolder = folder;
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }



    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li class="items-center">
                            <img class="invert" src="/assets/icons/music.svg" alt="">
                            <div class="info">
                                <div class="named" >${decodeURI(song)}</div>
                                <div class="font">--Mr. Zain</div>
                            </div>
                            <div class="playnow flex items-center">
                                <span class="green">PlayNow</span>
                                <img class="invert svg" src="/assets/icons/play.svg" alt="">
                            </div>
                        </li>`;

    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "/assets/icons/pause.svg";
        
    }
    
    
    document.querySelector(".innerp").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00";


      // remove mp3 last effort 
      let songname = document.querySelector(".innerp");
      let textContent = songname.textContent
      
  
      let b = textContent.replace(".mp3", "")
      
  
      textContent = b;
  
  
      songname.innerHTML = b;

}

let labtitle;

async function displayAlbums() {
    let a = await fetch('/songs/')
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[1];
            console.log('this is folder: ',folder);
            

            // get the metadata of the folder 
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            labtitle = folder;

            // Fetch songs in the folder
            const songsResponse = await fetch(`/songs/${folder}/`);
            const songsHTML = await songsResponse.text();
            const songsDiv = document.createElement("div");
            songsDiv.innerHTML = songsHTML;
            const songLinks = songsDiv.getElementsByTagName("a");
            const numSongs = Array.from(songLinks).filter(link => link.href.endsWith(".mp3")).length;
            let sing = "songs";

            if(numSongs == 1){
                sing = "song"
            }

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}"  class="card">
                <div  class="play">
                    <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" class="custom-svg">
                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" fill="black"></path>
                    </svg>
                </div>
                <div><img src="/songs/${folder}/cover.jpeg" alt="lofi beats"></div>
                <h2>${response.title}</h2>
                <p>${numSongs} ${sing}</p>
            </div> `;

            // Modify the code inside the displayAlbums function
            Array.from(document.getElementsByClassName("card")).forEach(e => {
                e.addEventListener("click", async item => {
                    const folder = item.currentTarget.dataset.folder;

                    // Fetch the JSON file associated with the clicked card
                    try {
                        const response = await fetch(`/songs/${folder}/info.json`);
                        const jsonData = await response.json();

                        lab.innerHTML = jsonData.title;

                        // Process the JSON data as needed
                    } catch (error) {
                        console.error('Error fetching JSON file:', error);
                    }
                });
            });
        }
    }

    // load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            // play.src = "/assets/icons/play.svg";

        })
    })
}


async function main() {
    await getsongs("songs/01_sidhu")
    playMusic(songs[0], true)

    // display all the albums on the page 
    displayAlbums();



    //Attach an event listener to play, next and pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/assets/icons/pause.svg"
        }

        else {
            currentSong.pause();
            play.src = "/assets/icons/play.svg"
        }
    })

    // listen space button 

    document.addEventListener("keydown", (e) => {
        if (e.keyCode === 32) {
            play.click();
        }
    })

    // listen for timeupdate event 

    currentSong.addEventListener("timeupdate", () => {

        let ctime = timeChange(currentSong.currentTime);
        let duration = timeChange(currentSong.duration);

        document.querySelector(".songtime").innerHTML = `${ctime}/${duration}`;
        document.querySelector(".circle").style.width = ((currentSong.currentTime / currentSong.duration) * 100 + 1) + "%";

        if (ctime === duration) {
            play.src = "/assets/icons/play.svg"
        }
    })

    // add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + 1;
        document.querySelector(".circle").style.width = percent + "%"
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    // add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        currentSong.pause();
        play.src = "/assets/icons/play.svg"
    })

    // add event listener to cross 
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    //add event listener to prevoius button
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add event listener to prevoius button
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

  

    // listen the volume
    let percent = document.querySelector(".percent");
    let volumeIcon = document.querySelector('.volicon');
    document.querySelector(".volrange").value = 70;
    currentSong.volume = .7;
    percent.innerHTML = document.querySelector(".volrange").value + "%";


    document.querySelector(".volrange").addEventListener("change", (e) => {

        let value = e.target.value;
        currentSong.volume = parseInt(value) / 100;

        if (e.target.value == 0) {

            volumeIcon.src = '/assets/icons/mute.svg';
        } else if (e.target.value < 51) {

            volumeIcon.src = '/assets/icons/low.svg';
        }
        else {
            volumeIcon.src = '/assets/icons/volume.svg';
        }

        percent.innerHTML = e.target.value + "%";


    });


    document.addEventListener("keydown", (e) => {
        if (e.keyCode === 77) {
            if (currentSong.volume === 0) {
                currentSong.volume = 1;
                document.querySelector(".volrange").value = 100;
                percent.innerHTML = document.querySelector(".volrange").value + "%";
                document.querySelector('.volicon').src = '/assets/icons/volume.svg';
            } else {
                currentSong.volume = 0;
                document.querySelector(".volrange").value = 0;
                percent.innerHTML = document.querySelector(".volrange").value + "%";
                document.querySelector('.volicon').src = '/assets/icons/mute.svg';
            }
        } else if (e.keyCode === 76) {
            currentSong.volume = 0.5;
            document.querySelector(".volrange").value = 50;
            percent.innerHTML = document.querySelector(".volrange").value + "%";
            document.querySelector('.volicon').src = '/assets/icons/low.svg';
        }
        else if (e.keyCode === 72) {
            currentSong.volume = 1;
            document.querySelector(".volrange").value = 100;
            percent.innerHTML = document.querySelector(".volrange").value + "%";
            document.querySelector('.volicon').src = '/assets/icons/volume.svg';
        }
    });

    let volicon = document.querySelector(".volicon");

    volicon.addEventListener("click", () => {
        if (currentSong.volume === 0) {
            currentSong.volume = 1;
            document.querySelector(".volrange").value = 100;
            percent.innerHTML = document.querySelector(".volrange").value + "%";
            volicon.src = '/assets/icons/volume.svg';
        } else {
            currentSong.volume = 0;
            document.querySelector(".volrange").value = 0;
            percent.innerHTML = document.querySelector(".volrange").value + "%";
            volicon.src = '/assets/icons/mute.svg';
        }
    });

    // add event listener to card to open menu 
     let card = document.getElementsByClassName("card");

     Array.from(card).forEach(element => {
        element.addEventListener("click",()=>{
            console.log('card is clicked');
            
        })
     });
    

    























}

main();




