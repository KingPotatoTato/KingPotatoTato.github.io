var timer;
var timerStart;
var totalTime
var timeSpentOnSite = getTimeSpentOnSite();

startCounting();

function getTimeSpentOnSite(){
    timeSpentOnSite = parseInt(localStorage.getItem('timeSpentOnSite'));
    timeSpentOnSite = isNaN(timeSpentOnSite) ? 0 : timeSpentOnSite;
    return timeSpentOnSite;
}

function startCounting(){
		timerStart = Date.now();
		timer = setInterval(function(){
    		timeSpentOnSite = getTimeSpentOnSite()+(Date.now()-timerStart);
    		localStorage.setItem('timeSpentOnSite',timeSpentOnSite);
    		timerStart = parseInt(Date.now());
        totalTime = parseInt(timeSpentOnSite/1000)
        
        const mins = Math.floor(totalTime / 60);
        const secs = totalTime - mins * 60;
        const finalTime = str_pad_left(mins, '0', 2) + ':' + str_pad_left(secs, '0', 2);
        document.getElementById("timer").innerHTML = finalTime;
		},1000);
}


function str_pad_left(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

