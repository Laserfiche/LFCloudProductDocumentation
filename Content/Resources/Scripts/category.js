$(document).ready(function () {
    //this part is for IE 7 support for .getElementsByClassName()
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function (search) {
            var d = document, elements, pattern, i, results = [];
            if (d.querySelectorAll) { // IE8
                return d.querySelectorAll("." + search);
            }
            if (d.evaluate) { // IE6, IE7
                pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
                elements = d.evaluate(pattern, d, null, 0, null);
                while ((i = elements.iterateNext())) {
                    results.push(i);
                }
            } else {
                elements = d.getElementsByTagName("*");
                pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
                for (i = 0; i < elements.length; i++) {
                    if (pattern.test(elements[i].className)) {
                        results.push(elements[i]);
                    }
                }
            }
            return results;
        }
    }

    function addStickyFooter() {
        if (!$('html').hasClass('ie7')) {
            $('html').css({ 'position': 'relative', 'min-height': '100%' });
            $('body').css({ 'margin': '0 0 75px' });
            $('div#myfooter').css({ 'position': 'absolute', 'left': '25', 'bottom': '0', 'height': '55px' });
        }
    }

    function getCategoriesXml() {
        //check to see if it is a local build.
        if (window.location.href.indexOf("support/webhelp") != -1) {
            var otherHref = window.top.location.href.toLowerCase().match(/\/webhelp\/.*/)[0].substring(9).replace(/\/.*/, "");
            var versionNumber = window.parent.location.href.match(/\/\d+\.?\d.*?\//)[0].replace(/\//g, "");
            switch (otherHref) {
                case "laserficheforms":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/laserficheforms/" + versionNumber + "/en-us/forms/Content/Categories.xml");
                    return;
                case "workflow":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/WorkFlow/" + versionNumber + "/en-US/Content/Categories.xml");
                    return;
                case "quickfields":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/QuickFields/" + versionNumber + "/en-US/Content/Categories.xml");
                    return;
            }

            var href = window.top.location.href.toLowerCase().match(/\/en-us.*/)[0].substring(7).replace(/\/.*/, "");
            switch (href) {
                case "adminguide":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/Laserfiche/" + versionNumber + "/en-US/AdminGuide/Content/Categories.xml");
                    return;
                case "userguide":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/Laserfiche/" + versionNumber + "/en-US/UserGuide/Content/Categories.xml");
                    return;
                case "webadminguide":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/Laserfiche/" + versionNumber + "/en-US/WebAdminGuide/Content/Categories.xml");
                    return;
                case "wa":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/WebAccess/" + versionNumber + "/en-US/WA/Content/Categories.xml");
                    return;
                case "waa":
                    window.myAjaxCall("https://www.laserfiche.com/support/webhelp/WebAccess/" + versionNumber + "/en-US/WAA/Content/Categories.xml");
                    return;
            }
        }
    }

    function generateNavBox() {
        var topic = document.getElementsByClassName('topicheading');
        if ($('div.roadmapbar').length == 0 && $(topic).length > 0) {
            $('<div class="sidebar"><span class="sidebarheading">In this topic</span><div class="sidebartoc"><ul class="innerstep"></ul></div></div>').insertBefore('h1');
        }
        $(topic).each(function () {
            var topicName = $(this).text();
            var linkName = topicName.replace(/\s/g, '');
            $('<a name="' + linkName + '"></a>').prependTo(this);
            $('<li><a class="topiclink navlinks" href="#' + linkName + '">' + topicName + '</a></li>').appendTo('ul.innerstep'); //nests the subheading under its heading in the navigation box
        });
        for (var i = 1; i < topic.length; i++) {
            $('<div><span class="totop" onclick="location.href=\'#top\'">To the top</span></div>').insertBefore(topic[i]);
        }
    }

    function headingCleaner() {
        if ($("h1").children().length > 0) {
            var h = $("h1").text();
            h = h.replace(/^\s*/gm, ''); // Each span on a new line generates a newline character and spaces. here we find spaces new lines and remove them.
            h = h.replace(/(\r\n|\n|\r)/gm, " "); // if there are leftover newlines, we'll replace them with a space (they might be between words)
            h = h.replace(/(\s+$)/, ""); //if there are spaces at the end of the string, we'll delete them.
        }
    }

    function findTopicInXml(xml) {
        var roots = $(xml).find('CatapultToc'); //give first-level TocEntries root attribute
        $(roots).children().attr('root', 'true');
        var removeRoadmapRoot = $(xml).find('TocEntry[root][conditions*="Roadmap"]'); //we don't want roadmaps to be categories, so we find the root ones and remove the root attribute
        $(removeRoadmapRoot).removeAttr('root');
        $('TocEntry', xml).each(function () { //for each TocEntry, look to see if its title matches the topic's heading
            if ($(this).attr("Title") === $("h1").text()) { //if there is a match
                $(this).attr('bingo', 'true'); // give the TocEntry the bingo attribute so we can find it later 
            }
        });
    }

    function addCategoriesToLandingPage(xml) {
        if ($('div.firstpagecat').length > 0) {
            $('div.firstpagecat').insertBefore('#shoe');
            $('body').css({ 'margin': '0 0 170px' });//make the body bottom margin bigger.
            $('#myfooter').css({ 'height': '150px' }); //make the footer bigger.
            var allCats = $(xml).find('TocEntry[root]');
            $(allCats).each(function () {
                var allCatLink = $(this).attr("Link");
                if (allCatLink === undefined) {
                    placeCategoriesInTopic.newLink = "";
                }
                allCatLink = allCatLink.replace(/\/Content\//, ""); //removes /content/
                $(this).attr("Link", allCatLink);
                $('<a class="navigation" href="' + $(this).attr("Link") + '">' + $(this).attr("Title") + '</a>"').appendTo('.destination');
            });
        }
    }

    function getRelativeLinksFromTopic(xml) {
        getRelativeLinksFromTopic.appender = ''; //initialize a variable to hold the ../ for the links
        var bingo = $(xml).find('TocEntry[bingo]');
        if (bingo.length > 0) {
            var bingoLink = bingo.attr('Link');
            if (bingoLink === undefined) {
                bingoLink = "";
            }
            var bingoDepth = bingoLink.match(/\//g); //find all the forward slashes in the link path
            var bingoCount = bingoDepth.length - 2; //gives us the number of '../' we should append to links
            for (var i = 0; i < bingoCount; i++) {
                getRelativeLinksFromTopic.appender += '../'; //creates a string we'll append to links later on.
            }
        }
    }

    function createCategoryPages(xml) {
        var list = []; //this is the variable that contains the html for the list we'll append to the ul element we created
        function listGenerator(n) {
            var childLink = $(n).attr("Link"); // create a variable for the child's link
            if (childLink === undefined) {
                childLink = "";
            }
            childLink = childLink.replace(/\/Content\//, ""); // change the link so that it will point to the right location
            $(n).attr("Link", childLink); // replace the old attribute value with the new one we just got this is an object i only want the first one
            list.push('<li><a href="' + getRelativeLinksFromTopic.appender + $(n).attr("Link") + '">' + $(n).attr("Title") + '</a></li>'); //update the string where the list is being placed with the current entry

            if ($(n).children().length > 0) { //if the item has children, it should have a <ul> in it
                var childTopics = $(n).children(); //find the topic's children
                for (var i = 0; i < childTopics.length; i++) { //iterate through them, adding them to the list
                    listGenerator($(childTopics[i]));
                }
            }
        } //close the listGenerator

        var catLandingPage = $(xml).find('TocEntry[root="true"][bingo="true"]'); //finds the root page the user is currently on

        if ($(catLandingPage).length > 0) { //sees if it is a root page.
            $('<div class="container"><h3>Topics in this category</h3><ul id="parentlist"></ul></div>').insertBefore('#myfooter'); //create the container for the list and put it before the last horizontal line
            var catChildren = $(catLandingPage).children(); // the children of the root page being viewed.
            for (var i = 0; i < catChildren.length; i++) { //iterate through each child to grab its children and place them in the list string.
                listGenerator($(catChildren[i]));
            }
            $('div.container > ul').append(list); //append the list we made to the appropriate spot on the document. 

            // sort the list
            var alphaList = { letters: [] };    //object to collect the li elements and a list of initial letters
            $("#parentlist").children("li").each(function () {
                var itmLetter = $(this).text().substring(0, 1).toUpperCase();
                if (!(itmLetter in alphaList)) {
                    alphaList[itmLetter] = [];
                    alphaList.letters.push(itmLetter);
                }
                alphaList[itmLetter].push($(this));    //add li element to the letter's array in the list object
            });

            alphaList.letters.sort();    //sort all available letters to iterate over them
            $.each(alphaList.letters, function (i, letter) {
                alphaList[letter].sort(function (a, b) {
                    return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());    //sort li elements of one letter
                });
                var ul = $("<ul class = 'sublist'/>");    //create new dom element and add li elements
                $.each(alphaList[letter], function (idx, itm) {
                    ul.append(itm);
                });
                $("#parentlist").append($("<li/>").append($("<a/>").attr("name", letter.toLowerCase()).addClass("title").html(letter)).append(ul));//add the list to a new li and to #list ul
            });
        }
    }

    function createRoadmap(xml) {
        var roadmap = $(xml).find('TocEntry[conditions*="Roadmap"]:has(TocEntry[bingo])');
        if ($(roadmap).length === 0) {
            roadmap = $(xml).find('TocEntry[conditions*="Roadmap"][bingo="true"]');
        }
        $(roadmap).removeAttr('root');
        $(roadmap).each(function () {
            var rmLink = $(this).attr("Link");
            if (rmLink === undefined) { rmLink = ""; }
            // rmLink = rmLink.match('([^/]+$)'); //finds and removes all the leading content up to the last /
            rmLink = rmLink.replace(/\/Content\//, "");
            $(this).attr("Link", rmLink);

            // creates the roadmap div container, puts the roadmap page title in it, creates the container for the list inside this div
            $('<div class="roadmapbar"><a class="roadmapheading" href="' + getRelativeLinksFromTopic.appender + $(this).attr("Link") + '">' + $(this).attr("Title") + '</a><div class="roadmaptoc"><ul id="steps"></ul></div></div>"').insertBefore('h1');

            //iterates through roadmap child pages, puts them in the list we just created. if they are the current page, we add the selected class.
            $(this).children().each(function () {
                var stepLink = $(this).attr("Link");
                if (stepLink === undefined) { stepLink = ""; }
                stepLink = stepLink.replace(/\/Content\//, ""); 
                $(this).attr("Link", stepLink); 

                //if this is the page they're on, highlight it in the list
                if ($(this).attr('bingo') === 'true') {
                    $('<li><a class="selected navlinks" href="' + getRelativeLinksFromTopic.appender + $(this).attr("Link") + '">' + $(this).attr("Title") + '</a><ul class="innerstep"></ul></li>"').appendTo('#steps');
                } else {
                    $('<li><a class="navlinks" href="' + getRelativeLinksFromTopic.appender + $(this).attr("Link") + '">' + $(this).attr("Title") + '</a></li>"').appendTo('#steps');
                }
            });
        });
    }

    function placeCategoriesInTopic(xml) {
        // here's where we look through each category to find the page being viewed
        var result = $(xml).find('TocEntry[root]:has(TocEntry[bingo])'); 
        if (result.length !== 0) { 
            $('body').css({ 'margin': '0 0 155px' }); 
            $('#myfooter').css({ 'height': '135px' });
            $('<div class="cat"><nav class="destination">Categories: </nav></div>').insertBefore('#shoe');
        }
        $(result).each(function () { //for each result, find its link attribute and put it through a regex so we can parse out the leading stuff we don't need
            placeCategoriesInTopic.newLink = $(this).attr("Link");
            if (placeCategoriesInTopic.newLink === undefined) {
                placeCategoriesInTopic.newLink = "";
            }  
            placeCategoriesInTopic.newLink = placeCategoriesInTopic.newLink.replace(/\/Content\//, ""); //removes /content/
            $(this).attr("Link", placeCategoriesInTopic.newLink);
            $('<a class="navigation" href="' + getRelativeLinksFromTopic.appender + $(this).attr("Link") + '">' + $(this).attr("Title") + '</a>"').appendTo('.destination'); //appends a link to each category in the category container
        });

    }

    addStickyFooter();
    generateNavBox();
    headingCleaner();
    

    window.myAjaxCall = function (url) { //we are passing the URL in the case that the topics are organized into folders. 
        var jqxhr = $.ajax({
            type: "GET",
            url: url,
            dataType: "xml",
            success: function (xml) {
                findTopicInXml(xml);
                getRelativeLinksFromTopic(xml);
                addCategoriesToLandingPage(xml);
                placeCategoriesInTopic(xml);
                createRoadmap(xml);
                createCategoryPages(xml);
            }
        }
      );
    };
    getCategoriesXml();  
});

$(function() {
    if (jQuery.ui !== undefined) {
        $("#tabs").tabs();
        $(".tabs").tabs();
    }
});