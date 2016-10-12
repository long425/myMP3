require(["text!../music/music-list.json","jquery.min"],function(listData){
	var obj = JSON.parse(listData);
	//播放列表
	var musicList = obj.list;
	
	musicList.forEach(function(song){
		$("<li></li>")
		.text(song)
		.appendTo($("#list-box"));
	})
	
	//当前播放到哪首歌.
	var musicIndex = -1;
	nextMusic();
	
	//当音乐加载完毕之后自动播放
	$('#player')[0].oncanplay = function(){
		$("#player")[0].play();
		
		$("#lyric-box p").click(function(e){
			var targetLine = $("#lyric-box p").index(e.target)
			var time = lyricArray[targetLine].time;
			$("#player")[0].currentTime = time;
		})
	}
	
	//播放下一首歌
	function nextMusic(){
		musicIndex++;
		if (musicIndex>musicList.length-1) {
			musicIndex = 0;
		}
		loadMusic()			
	}
	
	//存放歌词数据的数组
	var lyricArray;
	
    //开始加载歌词和歌曲
	function loadMusic(){
		var musicName = musicList[musicIndex];	
		
//		$("#lyric-box").css("background-image","url(music/"+musicName+".jpg)");
		
		$("#cd").css("background-image","url(music/"+musicName+".jpg)");
		
		
		
		//歌词名称
		var lfn = "music/" + musicName + ".lrc";
		//下载歌词
		require(["text!../"+lfn],function(lyric){
//			console.log(lyric)
			var reg = /\[(\d\d:\d\d\.\d\d)\](.*)/g;
			var arr;
			lyricArray = [];
			//把歌词整理成一个数组
			while(arr = reg.exec(lyric)){
				var line = {
					time:minuteToSecond(arr[1]),
					content:arr[2]
				}
				lyricArray.push(line)
			}
			
			//把歌词显示在lyric-box中
			var boxLyric = lyricArray.reduce(function(pre,obj){
				return pre+"<p>"+obj.content+"</p>";
			},"");
			$("#lyric-box").html(boxLyric)
			
				
			//歌词下载完之后下载歌曲
			$("#player")[0].src = "music/" + musicName + ".mp3";
			
			//每次加载歌曲后重置currentLine
			currentLine = 0
		});
		
	}
	
	//播放按钮
	var isPlaying = false;
	$("#playBtn").click(function(){
		
		if (isPlaying) {
			$("#player")[0].pause();
		} else{
			//audio元素对象的play函数：开始播放。
		    $("#player")[0].play();
		}	
	})
	
	//播放下一首按钮
    $("#nextBtn").click(function(){
    	$('#player')[0].pause();
    	nextMusic();
    })
	//播放上一首歌曲
	function previousMusic(){
		musicIndex--;
		if (musicIndex<0) {
			musicIndex = musicList.length-1;
		} 
		loadMusic()
	}
	//播放上一首按钮
	$("#preBtn").click(function(){
    	$('#player')[0].pause();
    	previousMusic();
    })
	
	
	
	//初始化进度条
	function changeProgress(e){
		var prog = e.offsetX/e.target.offsetWidth;
		//把点击进度条之后的进度显示在进度条之上
		$("#progress-bar").val(prog);
		//
		$("#player")[0].currentTime = $("#player")[0].duration*prog
	}
	
	
	$("#progress-bar").mousedown(function(e){
			changeProgress(e)
			
			$("#progress-bar")[0].onmousemove = function(e){
			changeProgress(e)
			};
	});
		
	$("#progress-bar").mouseup(function(e){
		$("#progress-bar")[0].onmousemove = null;
	})
	$("#progress-bar").mouseleave(function(e){
		$("#progress-bar")[0].onmousemove = null;
	})
	
	//转换分钟为秒数
	function minuteToSecond(m){
		
		var arr = m.split(":");
		
		return arr[0]*60+arr[1]*1;
	}
	
	
	
	
	//转换描述为分钟 
	function secondToMinute(s){
		var minute = Math.floor(s/60);
		var second = Math.floor(s%60);
		
		minute = minute<10?"0"+minute:minute;
		second = second<10?"0"+second:second;
		
		return minute+":"+second;
	}
	
	//定义一个变量，记录当前播放到哪一行了
	var currentLine;
	
	
	
	
	
	//播放进度条改变的回调函数
	$("#player")[0].ontimeupdate = function(e){
		var crt = secondToMinute(e.target.currentTime);
		var dut = secondToMinute(e.target.duration)
		$("#progress-label").text(crt + "/" + dut);
		
		if(e.target.currentTime/e.target.duration){
			//计算百分比进度显示在进度条上
			$("#progress-bar").val(e.target.currentTime/e.target.duration);
		}
		
		
		//找出当前时间点对应的歌词
		var line =findLineOfTime(e.target.currentTime);
		
		if(line!= currentLine||line==0){
			$("#lyric-box p")[currentLine].classList.remove("hightlight-line");
			$("#lyric-box p")[line].classList.add("hightlight-line");
			currentLine = line;
			
			var p = $("#lyric-box p")[line];
			console.log(p.offsetTop);
			$("#lyric-box").animate({
				scrollTop:p.offsetTop-150
			},300,"linear");
		}
		
		
		
	};
	
	//找到某个时间点对应歌词的行数。
	function findLineOfTime(t){
		var i = 0;
		while(i<lyricArray.length){
			if(lyricArray[i].time>t){
				return i-1<0?0:i-1;
			}
			i++;	
		}
		return;
	}
	
	
	
	
	//开始播放的回调函数
	$("#player")[0].onplaying = function(){
		    $("#playBtn")
		    .removeClass("icon-play")
		    .addClass("icon-pause");
		    isPlaying = true; 
		    $("#cd").css("animation-play-state","running");
	}
	
	//暂停播放的回调函数
	$("#player")[0].onpause = function(){
			$("#playBtn")
		    .removeClass("icon-pause")
		    .addClass("icon-play");
		    isPlaying = false;
		    $("#cd").css("animation-play-state","paused")
	}
	
	//播放结束的回调函数
	$("#player")[0].onended = function(){
		$("#list-box li")[musicIndex].innerHTML = musicList[musicIndex];
		
		$("#playBtn")
		    .removeClass("icon-pause")
		    .addClass("icon-play");
		    isPlaying = false;
		nextMusic();
	}	
	
});