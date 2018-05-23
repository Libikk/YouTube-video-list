//It gets value from input
function onKeyDown(event) {
    if(event.keyCode === 13) {
        var inputValue = document.getElementById("form1").value;
        document.getElementById("form1").value = "";
        getVideoId(inputValue)
    }
}
function getVideoId(inputValue) {
    var videoId;
    //check id if is correct, videoId shoueld be 11 signs
    if (inputValue.length === 11) {
        videoId = inputValue;  
    }
    if(inputValue.length > 11) { 
        videoId = inputValue.slice(inputValue.length-11, inputValue.length);
    }
    //getData about video from ID
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/videos?id=' + videoId + '&key=AIzaSyDIjlifebgRsY7Xyuh5jIYOtHxeAEiMm7c&part=snippet,statistics',
        dataType: "json",
        success: function(data) {
            if(data.pageInfo.resultsPerPage === 0) {
                return alert("Wrong URL or VideoID!")
            }
            var vidPhoto = data.items[0].snippet.thumbnails.medium.url;
            var vidViews = data.items[0].statistics.viewCount;
            var vidLikes = data.items[0].statistics.likeCount;
            var vidTitle = data.items[0].snippet.localized.title;
            var vidDescritpion = data.items[0].snippet.localized.description.slice(0, 300) + "...";
            var vidSrc = "https://www.youtube.com/watch?v=" + data.items[0].id;
            createNewVidBarAndSaveToStorage(vidPhoto, vidViews, vidLikes, vidTitle, vidSrc, vidDescritpion, data.items[0].id, true);
        },
        error: function (request, status, error) {
            alert(request.responseText);
        }
      });
}
//remove videoBar from html and localStorage on "X" icon click
$(document).on('click', '.remove', function() {
    //remove div from html
    var div = $(this).parent()
    var divIdToRemove = div.attr('id');
    div.remove();
    //update current video number in blue circle
    updateCurrentVidNmber()
    //removeItfrom localStorage
    var videoList = JSON.parse(localStorage.getItem("video-list-creator"));
    for(i = 0; i < videoList.length; i++) {
        if(videoList[i].Id === divIdToRemove) {
            videoList.splice(i, 1);
            localStorage.setItem("video-list-creator", JSON.stringify(videoList))
        }
    }
});

function createNewVidBarAndSaveToStorage(vidPhoto, vidViews, vidLikes, vidTitle, vidSrc, vidDescritpion, videoId, saveDataLocalOrNot) {
    var output = '<div class="videoBar" id="' + videoId + '"><button class="remove" type="button"><i class="fa fa-remove" aria-hidden="true"></i></button><a class="link" href="' + vidSrc + '" target="_blank"><div class="left"><img src="' + vidPhoto + '"></div><div class="right"><h4>' + vidTitle + '</h4><p class="description">' + vidDescritpion + '</p><p class="views"><i class="fa fa-eye" aria-hidden="true"></i>&nbsp; ' + vidViews + '&nbsp; <i class="fa fa-thumbs-up" aria-hidden="true"></i>&nbsp; ' + vidLikes + '</p></div></div></a>';
    var  list = $("#list");
        list.append(output);
        //list.css("display","block");

    //save to storage all data about vidBar. Boolean is for save data or not 
    if (typeof(Storage) !== "undefined" && saveDataLocalOrNot) {
        var videoList= [];
        //load localStorage before update if there is any data
        if (JSON.parse(localStorage.getItem("video-list-creator"))) {
            var videoCreatorList = JSON.parse(localStorage.getItem("video-list-creator"))
            videoList = videoCreatorList;
        }
        var video = {
            "photo": vidPhoto,
            "views": vidViews,
            "likes": vidLikes,
            "title": vidTitle,
            "url": vidSrc,
            "description": vidDescritpion,
            "Id": videoId,
        }
        videoList.push(video)
        //update localStorage
        localStorage.setItem("video-list-creator", JSON.stringify(videoList));

    } else {
        // Sorry! No Web Storage support..
    }
    updateCurrentVidNmber()
}

//load all localStorage 
function loadlocalStorage() {
    var videoList = JSON.parse(localStorage.getItem("video-list-creator"));
    for (i = 0; i < videoList.length; i++) {
        createNewVidBarAndSaveToStorage(videoList[i].photo, videoList[i].views, videoList[i].likes, videoList[i].title, videoList[i].url, videoList[i].description, videoList[i].Id, false)
    }
    updateCurrentVidNmber()
}

// window.onload localStorage if there is any data
if(JSON.parse(localStorage.getItem("video-list-creator"))) {
    window.onload = loadlocalStorage()
}

var filtredVideos = [];
function filterFunction() {
    var searchInput = document.getElementById("form2");
    var filter = searchInput.value.toUpperCase();
    var mainDiv = document.getElementById("list");
    var allChilds = mainDiv.getElementsByClassName("videoBar");
    var filterContainer = [];
    for (i = 0; i < allChilds.length; i++) {
        var inputText = allChilds[i].getElementsByTagName("h4")[0].innerHTML.toUpperCase()
        if(inputText.indexOf(filter) > -1) {
            allChilds[i].style.display = "";
            filterContainer.push(allChilds[i])
        } else {
            allChilds[i].style.display = "none";
        }
    }
    $(".pages ul").html("");
    filtredVideos = filterContainer;
}

function updateCurrentVidNmber() {
    var videoList = document.getElementById("list");
    var vidNum = videoList.getElementsByClassName("videoBar").length;
    $("#videoCounter").html(vidNum);
};

var howManyVideoPerPAge;
function show(firstThisMuch) {
    //display list videos after clicking button  x perPage
    howManyVideoPerPAge = firstThisMuch;
    if(document.getElementById("form2").value !== "") {
        var howManyPages = Math.ceil(filtredVideos.length / firstThisMuch);
        $(".pages ul").html("")
        for (i = 0; i < howManyPages; i++) {
            var page = i + 1;
            $(".pages ul").append("<li class='pagesli'><a href='#'> [ <span class='pageNumber'>" + page + "</span> ] </a></li>").hide().fadeIn(250)
        };
    } else {
    displayVideos(1, howManyVideoPerPAge)
    //calculate number of pages needed
    var mainDiv = document.getElementById("list");
    var allChilds = mainDiv.getElementsByClassName("videoBar");
    var howManyPages =  Math.ceil(allChilds.length / firstThisMuch);
    $(".pages ul").html("")
    for (i = 0; i < howManyPages; i++) {
        var page = i + 1;
        $(".pages ul").append("<li class='pagesli'><a href='#'> [ <span class='pageNumber'>" + page + "</span> ] </a></li>").hide().fadeIn(250)
        };
    }
};

//display number "x" page
$(document).on('click', '.pagesli', function() {
    var clickedPageNumber = $(this).find("span").text();
    displayVideos(clickedPageNumber, howManyVideoPerPAge)
});

function displayVideos(clickedPageNumber, howManyVideoPerPAge) {
    var displayTheseChilds = [];
    //hide all videos
    var allChilds = $("#list").find(".videoBar").css("display","none");

    if(document.getElementById("form2").value !== "") {
        var displayFromChild = howManyVideoPerPAge * clickedPageNumber - howManyVideoPerPAge;
        var displayToChild = howManyVideoPerPAge * clickedPageNumber;
        while (displayFromChild < displayToChild) {
            //here do some staff insert some if's into each function about  filtredVideos
            if(displayToChild > filtredVideos.length) {
                displayToChild = filtredVideos.length
            }
            
            var indexOfChild = $(filtredVideos[displayFromChild]).index()
            displayTheseChilds.push(indexOfChild + 1);  
            //id doesnt work whY?
            
            displayFromChild++;
        }
    } else {
        var displayFromChild = howManyVideoPerPAge * clickedPageNumber - (howManyVideoPerPAge - 1);
        var displayToChild = howManyVideoPerPAge * clickedPageNumber + 1;
        
        while(displayFromChild < displayToChild) {
        //var selector = $("#list .videoBar:nth-child(" + displayFromChild + ")").css("display", "block");
            displayTheseChilds.push(displayFromChild)
            displayFromChild++
        }
    }
    displayTheseChilds.forEach(render)

}
function render(item) {
    $("#list .videoBar:nth-child(" + item + ")").css("display", "block");
}

//10 random videos from specific channel
function extra10videos() {
    var youTubeChannel = "GoogleDevelopers"
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=' + youTubeChannel + '&key=AIzaSyDIjlifebgRsY7Xyuh5jIYOtHxeAEiMm7c',
        dataType: "json",
        success: function(data) {
            
            $.get(
                "https://www.googleapis.com/youtube/v3/playlistItems" ,{
                part: 'snippet',
                maxResults: 50,
                playlistId: data.items[0].contentDetails.relatedPlaylists.uploads,
                dataType: "json",
                key: 'AIzaSyDIjlifebgRsY7Xyuh5jIYOtHxeAEiMm7c'},
                function(dataOfplaylist) {
                    for(i = 0; i < 10; i++) {
                        var random = Math.floor(Math.random() * 50) + 1;
                        var randomVideoId = dataOfplaylist.items[random].snippet.resourceId.videoId;
                        //    for(i = 0; $(".videoBar").length > i; i++) {
                        //        if($(".videoBar")[i].id !== randomVideoId){
                                getVideoId(randomVideoId);
                        //    }
                       // }


                }}
            );
        },
        error: function () {
            console.log("Error extra10videos function!")
        }
      });

}
