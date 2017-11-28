
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // Collect street address and city
    var streetAddress = $('input#street').val();
    var city = $('input#city').val();
    var width = $(window).width();
    var height = $(window).height();
    var urlString = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=`
    var completeUrl = `${urlString}${streetAddress}, ${city}`;

    // Change/append to html
    var imgElem = `<img class="bgimg" src="${completeUrl}">`;
    if (streetAddress.length === 0) {
        $greeting.text(`So you want to live in ${city}?`);
    } else {
        $greeting.text(`So you want to live in ${streetAddress}, ${city}?`);
    }

    $body.append(imgElem);
    // NYTimes article search API AJAX
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
        'api-key': "1c21d35684814435a508d1b04df17c71",
        'q': `${city}`,
        'sort': "newest"
    });
    $.getJSON(url, function(data) {
        var articles = data["response"]["docs"];
        for (var i = 0; i < articles.length; i++) {
            var article = articles[i];
            var url = article["web_url"];
            var title = article["headline"]["main"];
            var paragraph = article["snippet"];
            $('#nytimes-articles').append(
                `<a href="${url}">${title}</a>
                <p>${paragraph}</p>`
            );
        }
    }).fail(function() {
        // If the AJAX request fails, change header to this message
        $('#nytimes-header').text("New York Times articles could not be loaded");
        }
    );

    // Wikipedia API AJAX
    var wikiUrl = "https://en.wikipedia.org/w/api.php";
    wikiUrl += '?' + $.param({
        'action': "opensearch",
        'search': `${city}`,
        'format': "json"
    });

    // Error handling for JSON-P
    var wikiRequestTimeout = setTimeout(function() {
        $wikiElem.text("Failed to retrieve Wikipedia resources");
    }, 8000);

    $.ajax({
        dataType: "jsonp",
        url: wikiUrl,
        success: function(data) {
            var names = data[1];
            var links = data[3];

            for (var i = 0; i < names.length; i++) {
                var entryName = names[i];
                var entryLink = links[i];

                $('#wikipedia-links').append(
                    `<li><a href="${entryLink}">${entryName}</a></li>`
                );
            }
            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
};

$('#form-container').submit(loadData);
