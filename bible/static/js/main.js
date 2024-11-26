var mainApp = angular.module("mainApp", []);

function config($interpolateProvider)
{
    $interpolateProvider.startSymbol("{|");
    $interpolateProvider.endSymbol("|}");
}
config.$inject = ["$interpolateProvider"];
mainApp.config(config);

function mainController($scope, $http)
{
    $scope.isLoading = true;
    $scope.bible = bible;

    $scope.versions =
    [
        { id: 0, name: "和合本", shorthand: "cuv" },
        { id: 1, name: "和修本", shorthand: "rcuv" },
        { id: 2, name: "新譯本", shorthand: "cnv" }
    ];

    $scope.shorthandToId =
    {
        "創"	: 0, 
        "出"	: 1, 
        "利"	: 2, 
        "民"	: 3, 
        "申"	: 4, 
        "書"	: 5, 
        "士"	: 6, 
        "得"	: 7, 
        "撒上"	: 8, 
        "撒下"	: 9, 
        "王上"	: 10, 
        "王下"	: 11, 
        "代上"	: 12, 
        "代下"	: 13, 
        "拉"	: 14, 
        "尼"	: 15, 
        "斯"	: 16, 
        "伯"	: 17, 
        "詩"	: 18, 
        "箴"	: 19, 
        "傳"	: 20, 
        "歌"	: 21, 
        "賽"	: 22, 
        "耶"	: 23, 
        "哀"	: 24, 
        "結"	: 25, 
        "但"	: 26, 
        "何"	: 27, 
        "珥"	: 28, 
        "摩"	: 29, 
        "俄"	: 30, 
        "拿"	: 31, 
        "彌"	: 32, 
        "鴻"	: 33, 
        "哈"	: 34, 
        "番"	: 35, 
        "該"	: 36, 
        "亞"	: 37, 
        "瑪"	: 38, 
        "太"	: 39, 
        "可"	: 40, 
        "路"	: 41, 
        "約"	: 42, 
        "徒"	: 43, 
        "羅"	: 44, 
        "林前"	: 45, 
        "林後"	: 46, 
        "加"	: 47, 
        "弗"	: 48, 
        "腓"	: 49, 
        "西"	: 50, 
        "帖前"	: 51, 
        "帖後"	: 52, 
        "提前"	: 53, 
        "提後"	: 54, 
        "多"	: 55, 
        "門"	: 56, 
        "來"	: 57, 
        "雅"	: 58, 
        "彼前"	: 59, 
        "彼後"	: 60, 
        "約一"	: 61, 
        "約二"	: 62, 
        "約三"	: 63, 
        "猶"	: 64, 
        "啟"	: 65
    };
        
    $scope.books =
    [
        { id: 0, name: "創世記", shorthand: "創", category: "摩西五經" }, 
        { id: 1, name: "出埃及記", shorthand: "出", category: "摩西五經" }, 
        { id: 2, name: "利未記", shorthand: "利", category: "摩西五經" }, 
        { id: 3, name: "民數記", shorthand: "民", category: "摩西五經" }, 
        { id: 4, name: "申命記", shorthand: "申", category: "摩西五經" }, 
        { id: 5, name: "約書亞記", shorthand: "書", category: "歷史書" }, 
        { id: 6, name: "士師記", shorthand: "士", category: "歷史書" }, 
        { id: 7, name: "路得記", shorthand: "得", category: "歷史書" }, 
        { id: 8, name: "撒母耳記上", shorthand: "撒上", category: "歷史書" }, 
        { id: 9, name: "撒母耳記下", shorthand: "撒下", category: "歷史書" }, 
        { id: 10, name: "列王紀上", shorthand: "王上", category: "歷史書" }, 
        { id: 11, name: "列王紀下", shorthand: "王下", category: "歷史書" }, 
        { id: 12, name: "歷代志上", shorthand: "代上", category: "歷史書" }, 
        { id: 13, name: "歷代志下", shorthand: "代下", category: "歷史書" }, 
        { id: 14, name: "以斯拉記", shorthand: "拉", category: "歷史書" }, 
        { id: 15, name: "尼希米記", shorthand: "尼", category: "歷史書" }, 
        { id: 16, name: "以斯帖記", shorthand: "斯", category: "歷史書" }, 
        { id: 17, name: "約伯記", shorthand: "伯", category: "詩歌智慧書" }, 
        { id: 18, name: "詩篇", shorthand: "詩", category: "詩歌智慧書" }, 
        { id: 19, name: "箴言", shorthand: "箴", category: "詩歌智慧書" }, 
        { id: 20, name: "傳道書", shorthand: "傳", category: "詩歌智慧書" }, 
        { id: 21, name: "雅歌", shorthand: "歌", category: "詩歌智慧書" }, 
        { id: 22, name: "以賽亞書", shorthand: "賽", category: "大先知書" }, 
        { id: 23, name: "耶利米書", shorthand: "耶", category: "大先知書" }, 
        { id: 24, name: "耶利米哀歌", shorthand: "哀", category: "大先知書" }, 
        { id: 25, name: "以西結書", shorthand: "結", category: "大先知書" }, 
        { id: 26, name: "但以理書", shorthand: "但", category: "大先知書" }, 
        { id: 27, name: "何西阿書", shorthand: "何", category: "小先知書" }, 
        { id: 28, name: "約珥書", shorthand: "珥", category: "小先知書" }, 
        { id: 29, name: "阿摩司書", shorthand: "摩", category: "小先知書" }, 
        { id: 30, name: "俄巴底亞書", shorthand: "俄", category: "小先知書" }, 
        { id: 31, name: "約拿書", shorthand: "拿", category: "小先知書" }, 
        { id: 32, name: "彌迦書", shorthand: "彌", category: "小先知書" }, 
        { id: 33, name: "那鴻書", shorthand: "鴻", category: "小先知書" }, 
        { id: 34, name: "哈巴谷書", shorthand: "哈", category: "小先知書" }, 
        { id: 35, name: "西番雅書", shorthand: "番", category: "小先知書" }, 
        { id: 36, name: "哈該書", shorthand: "該", category: "小先知書" }, 
        { id: 37, name: "撒迦利亞書", shorthand: "亞", category: "小先知書" }, 
        { id: 38, name: "瑪拉基書", shorthand: "瑪", category: "小先知書" }, 
        { id: 39, name: "馬太福音", shorthand: "太", category: "福音書" }, 
        { id: 40, name: "馬可福音", shorthand: "可", category: "福音書" }, 
        { id: 41, name: "路加福音", shorthand: "路", category: "福音書" }, 
        { id: 42, name: "約翰福音", shorthand: "約", category: "福音書" }, 
        { id: 43, name: "使徒行傳", shorthand: "徒", category: "新約歷史書" }, 
        { id: 44, name: "羅馬書", shorthand: "羅", category: "保羅書信" }, 
        { id: 45, name: "哥林多前書", shorthand: "林前", category: "保羅書信" }, 
        { id: 46, name: "哥林多後書", shorthand: "林後", category: "保羅書信" }, 
        { id: 47, name: "加拉太書", shorthand: "加", category: "保羅書信" }, 
        { id: 48, name: "以弗所書", shorthand: "弗", category: "保羅書信" }, 
        { id: 49, name: "腓立比書", shorthand: "腓", category: "保羅書信" }, 
        { id: 50, name: "歌羅西書", shorthand: "西", category: "保羅書信" }, 
        { id: 51, name: "帖撒羅尼迦前書", shorthand: "帖前", category: "保羅書信" }, 
        { id: 52, name: "帖撒羅尼迦後書", shorthand: "帖後", category: "保羅書信" }, 
        { id: 53, name: "提摩太前書", shorthand: "提前", category: "保羅書信" }, 
        { id: 54, name: "提摩太後書", shorthand: "提後", category: "保羅書信" }, 
        { id: 55, name: "提多書", shorthand: "多", category: "保羅書信" }, 
        { id: 56, name: "腓利門書", shorthand: "門", category: "保羅書信" }, 
        { id: 57, name: "希伯來書", shorthand: "來", category: "普通書信" }, 
        { id: 58, name: "雅各書", shorthand: "雅", category: "普通書信" }, 
        { id: 59, name: "彼得前書", shorthand: "彼前", category: "普通書信" }, 
        { id: 60, name: "彼得後書", shorthand: "彼後", category: "普通書信" }, 
        { id: 61, name: "約翰一書", shorthand: "約一", category: "普通書信" }, 
        { id: 62, name: "約翰二書", shorthand: "約二", category: "普通書信" }, 
        { id: 63, name: "約翰三書", shorthand: "約三", category: "普通書信" }, 
        { id: 64, name: "猶大書", shorthand: "猶", category: "普通書信" }, 
        { id: 65, name: "啟示錄", shorthand: "啟", category: "普通書信" }
    ];

    $scope.current =
    {
        version : $scope.versions[0].shorthand,
        book    : 0,
        chapter : 0,
        verse   : 0
    };

    $scope.go =
    {
        book    : $scope.books[0],
        chapter : 1,
        verse   : 1
    };
    
    var lib = init($scope);

    $scope.onGoChapterChanged = function()
    {
        if($scope.go.chapter > 0 && $scope.go.chapter <= $scope.bible[$scope.current.version][$scope.go.book.id].length)
        {
            var max = $scope.bible[$scope.current.version][$scope.go.book.id][$scope.go.chapter - 1].length;
            if(isNaN($scope.go.verse) || $scope.go.verse > max) $scope.go.verse = max;
        }
        else
        {
            $scope.go.verse = 0;
        }
    };

    $scope.setChapterTooltip = function()
    {
    }

    $scope.onGoButtonClicked = function($event)
    {
        $event.currentTarget.blur();
        if($scope.go.chapter > 0 && $scope.go.chapter <= $scope.bible[$scope.current.version][$scope.go.book.id].length && $scope.go.verse > 0 && $scope.go.verse <= $scope.bible[$scope.current.version][$scope.go.book.id][$scope.go.chapter - 1].length)
        {
            lib.goTo($scope.go.book.id, $scope.go.chapter - 1, $scope.go.verse - 1);
        }
    };

    $scope.onVersionButtonClicked = function($event, index)
    {
        $event.currentTarget.blur();
        if($scope.current.version != $scope.versions[index].shorthand)
        {
            $scope.current.version = $scope.versions[index].shorthand;
            setTimeout(function()
            {
                lib.resize();
            }, 50);
        }
    };

    $scope.command = "";
}
mainController.$inject = ["$scope", "$http"];
mainApp.controller("mainController", mainController);

function init($scope)
{
    var versesOffset = [];
    var verseRegex = /^(\d*)$/;
    var chapterRegex = /^(\d+)[:：](\d*)$/;
    var bookRegex = /^(\D+)(\d*)([:：](\d*))?$/;

    function buildVersesOffset()
    {
        versesOffset = [];
        $("tbody > tr").each(function()
        {
            versesOffset.push($(this).offset().top);
        });
    }

    function scrollToVerse(verse)
    {
        $("html, body").animate({ scrollTop: versesOffset[verse] + 2 }, 100);
    }

    function resize()
    {
        buildVersesOffset();
        scrollToVerse($scope.current.verse);
    }

    function getVerseByOffset(offset)
    {
        for(var i = 0; i < versesOffset.length; ++i)
        {
            if(versesOffset[i] > offset) return i - 1;
        }
        return versesOffset.length - 1;
    }

    function onWrongCommand()
    {
        var target = $("#commandInput").parent();
        target.addClass("has-error");
        setTimeout(function()
        {
            target.removeClass("has-error");
        }, 2000);
    }

    function goTo(book, chapter, verse)
    {
        $scope.current.book = book;
        $scope.current.chapter = chapter;
        $scope.current.verse = verse;
        setTimeout(function()
        {
            buildVersesOffset();
            scrollToVerse($scope.current.verse);
        }, 50);
    }

    $(function()
    {
        buildVersesOffset();
        
        $(document).on("scroll", function()
        {
            var verse = getVerseByOffset($(document).scrollTop());
            $scope.$apply(function()
            {
                $scope.current.verse = verse;
            });
        });

        $(document).on("keydown", function(event)
        {
            if($(event.target).hasClass("go")) return true;
            var keyCode = event.keyCode;
            if((keyCode < 37 || keyCode > 40) && keyCode != 13 && keyCode != 27) return true;
            event.preventDefault();
            if(keyCode == 38) // up
            {
                if($scope.current.verse == 0) return;
                scrollToVerse($scope.current.verse - 1);
            }
            else if(keyCode == 40) // down
            {
                if($scope.current.verse == $scope.bible[$scope.current.version][$scope.current.book][$scope.current.chapter].length - 1) return;
                scrollToVerse($scope.current.verse + 1);
            }
            else if(keyCode == 37) // left
            {
                if($scope.current.chapter == 0) return;
                $scope.$apply(function()
                {
                    $scope.current.chapter--;
                });
                buildVersesOffset();
                scrollToVerse(0);
            }
            else if(keyCode == 39) // right
            {
                if($scope.current.chapter == $scope.bible[$scope.current.version][$scope.current.book].length - 1) return;
                $scope.$apply(function()
                {
                    $scope.current.chapter++;
                });
                buildVersesOffset();
                scrollToVerse(0);
            }
            else if(keyCode == 13) // enter
            {
                var commandInput = $("#commandInput");
                if(commandInput.hasClass("focus"))
                {
                    if($scope.command.length == 0)
                    {
                        commandInput.blur();
                    } 
                    else
                    {
                        var result;
                        if(result = $scope.command.match(verseRegex))
                        {
                            var verse = result[1];
                            if(verse > 0 && verse <= $scope.bible[$scope.current.version][$scope.current.book][$scope.current.chapter].length)
                            {
                                $scope.$apply(function()
                                {
                                    $scope.current.verse = verse - 1;
                                    $scope.command = "";
                                });
                                scrollToVerse($scope.current.verse);
                                commandInput.blur();
                            }
                            else
                            {
                                onWrongCommand();
                            }
                        }
                        else if(result = $scope.command.match(chapterRegex))
                        {
                            var chapter = result[1];
                            var verse = result[2];
                            if(typeof(verse) == "undefined" || verse == "") verse = 1;
                            if(chapter > 0 && chapter <= $scope.bible[$scope.current.version][$scope.current.book].length &&
                                verse > 0 && verse <= $scope.bible[$scope.current.version][$scope.current.book][chapter - 1].length)
                            {
                                $scope.$apply(function()
                                {
                                    $scope.current.chapter = chapter - 1;
                                    $scope.current.verse = verse - 1;
                                    $scope.command = ""; 
                                });
                                buildVersesOffset();
                                scrollToVerse($scope.current.verse);
                                commandInput.blur();
                            }
                            else
                            {
                                onWrongCommand();
                            }
                        }
                        else if(result = $scope.command.match(bookRegex))
                        {
                            var shorthand = result[1];
                            var chapter = result[2];
                            var verse = result[4];
                            if(typeof(chapter) == "undefined" || chapter == "") chapter = 1;
                            if(typeof(verse) == "undefined" || verse == "") verse = 1;
                            var book = $scope.shorthandToId[shorthand];
                            if(typeof(book) != "undefined" &&
                                chapter > 0 && chapter <= $scope.bible[$scope.current.version][book].length &&
                                verse > 0 && verse <= $scope.bible[$scope.current.version][book][chapter - 1].length)
                            {
                                $scope.$apply(function()
                                {
                                    $scope.current.book = book;
                                    $scope.current.chapter = chapter - 1;
                                    $scope.current.verse = verse - 1;
                                    $scope.command = ""; 
                                });
                                buildVersesOffset();
                                scrollToVerse($scope.current.verse);
                                commandInput.blur();
                            }
                            else
                            {
                                onWrongCommand();
                            }
                        }
                        else
                        {
                            onWrongCommand();
                        }
                    }
                }
                else
                {
                    commandInput.focus();
                }
            }
            else if(keyCode == 27)
            {
                var commandInput = $("#commandInput");
                if(commandInput.hasClass("focus"))
                {
                    commandInput.blur();
                }
            }
            return false;
        });
        
        $("#commandInput").on("focus", function()
        {
            $(this).addClass("focus");
        });

        $("#commandInput").on("blur", function()
        {
            $(this).removeClass("focus");
        });

        $(window).resize(resize);
    });

    return { goTo: goTo, resize: resize };
}
