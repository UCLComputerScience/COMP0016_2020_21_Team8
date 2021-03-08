$(function() {
    'use strict'; // Start of use strict
   
   

    /*--------------------------
    scrollUp
    ---------------------------- */
    $.scrollUp({
        scrollText: '<i class="fa fa-angle-up"></i>',
        easingType: 'linear',
        scrollSpeed: 900,
        animation: 'fade'
	});

	   /*------------------------------------------------------------------
		Portfolio Sec
	------------------------------------------------------------------*/
	
	$('.venobox').venobox({
		titleattr: 'data-title',
		spinner: 'three-bounce',
		titlePosition: 'bottom',
		titleColor: '#fff',
		spinColor: '#fff',
		numeratio: true,
		numerationPosition: 'top'
	});

	/*------------------------------------------------------------------
		Time Counter
	------------------------------------------------------------------*/	
	function makeTimer() {
	    var endTime = new Date("01 January 2022 00:00:00 GMT+05:30");
	    endTime = (Date.parse(endTime) / 1000);
	    var now = new Date();
	    now = (Date.parse(now) / 1000);
	    var timeLeft = endTime - now;
	    var days = Math.floor(timeLeft / 86400);
	    var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
	    var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
	    var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
	    if (hours < "10") {
	      hours = "0" + hours;
	    }
	    if (minutes < "10") {
	      minutes = "0" + minutes;
	    }
	    if (seconds < "10") {
	      seconds = "0" + seconds;
	    }
	    $("#cvdays").html(days);
	    $("#cvhours").html(hours);
	    $("#cvminutes").html(minutes);
	    $("#cvseconds").html(seconds);
	}		
	setInterval(function () {
	    makeTimer();
	}, 1000);
 	  /*----------------------------
        		testimonial slider Active
     ------------------------------*/

			$(".testimonial-wraper").owlCarousel({
				loop: true,
				autoplay: true,
				animateIn: 'zoomInDown',
				smartSpeed: 1000,
				dots: false,
				nav: true,
				navText: ["<i class='fa fa-long-arrow-left'></i>", "<i class='fa fa-long-arrow-right'></i>"],
				responsive: {
					0: {
						items: 1
					},
					600: {
						items: 1
					},
					1000: {
						items: 1
					}
				}
			});
   /*------------------------------------------------------------------
		Quote Popup
	------------------------------------------------------------------*/	   
	$('.open-popup-link').magnificPopup({
        type: 'inline',
        midClick: true,
        mainClass: 'mfp-fade'
	});  
	

    /*--------------------------
    Banner Carousel
    ---------------------------- */

	if ($('.banner-carousel').length) {
		var swiper = new Swiper('.banner-carousel', {
			//animateOut: 'slideInDown',
    		//animateIn: 'slideIn',
			pagination: {
			el: '.swiper-pagination',
			type: 'progressbar',
			},
			navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		  },
		});   		
    }
	
	/*--------------------------
    Header Sticky
    ---------------------------- */

	$(window).on('scroll', function() {
		if ($(this).scrollTop() >150){  
			$('.main-header').addClass("fixed-header");
		}
		else{
			$('.main-header').removeClass("fixed-header");
		}
	}); 

	/*--------------------------
    	Odometer JS
    ---------------------------- */	
	$('.odometer').appear(function(e) {
		var odo = $(".odometer");
		odo.each(function() {
			var countNumber = $(this).attr("data-count");
			$(this).html(countNumber);
		});
	});
   /*--------------------------
    Submenu Dropdown Toggle
    ---------------------------- */  

	if($('.main-header li.dropdown ul').length){
		$('.main-header .navigation li.dropdown').append('<div class="dropdown-btn"><span class="fa fa-angle-down"></span></div>');
		
		//Dropdown Button
		$('.main-header .navigation li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('ul').slideToggle(500);
		});
		
		//Disable dropdown parent link
		$('.main-header .navigation li.dropdown > a').on('click', function(e) {
			e.preventDefault();
		});
	}
	
   /*--------------------------
    Mobile Nav Hide Show
    ---------------------------- */  	

    if($('.mobile-menu').length){
		
		var mobileMenuContent = $('.main-header .nav-outer .main-menu .navigation').html();
		$('.mobile-menu .navigation').append(mobileMenuContent);
		$('.sticky-header .navigation').append(mobileMenuContent);
		$('.mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});
		//Dropdown Button
		$('.mobile-menu li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('ul').slideToggle(500);
		});
		//Menu Toggle Btn
		$('.mobile-nav-toggler').on('click', function() {
			$('body').addClass('mobile-menu-visible');
		});

		//Menu Toggle Btn
		$('.mobile-menu .menu-backdrop,.mobile-menu .close-btn').on('click', function() {
			$('body').removeClass('mobile-menu-visible');
		});

	}

	/*------------------------------------------------------------------
        Year
    ------------------------------------------------------------------*/
	$(function(){
    var theYear = new Date().getFullYear();
    $('#year').html(theYear);
	});

});

$('.image-popup').magnificPopup({
	closeBtnInside : true,
	type           : 'image',
	mainClass      : 'mfp-with-zoom'
});


/*------------------------------------------------------------------
 Loader 
------------------------------------------------------------------*/
jQuery(window).on("load scroll", function() {
    'use strict'; // Start of use strict
    // Loader 
     $('#dvLoading').fadeOut('slow', function () {
            $(this).remove();
        });
	
});
