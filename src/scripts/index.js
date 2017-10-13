// import ext from "./utils/ext";
// import storage from "./utils/storage";
$(function () {
    window.favoriteHeaders = [];
    window.favoriteUrls = [];


    /**************************** Init Toastr ********************************/
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "progressBar": true,
      "preventDuplicates": true,
      "positionClass": "toast-bottom-full-width",
      "onclick": null,
      "showDuration": "400",
      "hideDuration": "1000",
      "timeOut": "7000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };

    /********************** Init Request Method & URL **************************/
    $('#request-method, #request-url').on('focus', function(){
        $(this).select();
    });
    $('#request-method-dropdown a').on('click', function(){
        var method = $(this).text();
        $('#request-method').val(method);
    });
    // Load favorite urls from storage
    $('.btn-toggle-favorite-url').prop('disabled', true);
    browser.storage.local.get('request-urls').then(
        (data) => {
            console.log(data);
            if(data['request-urls'] && data['request-urls'].length > 0)
            {
                window.favoriteUrls = data['request-urls'];
            }
            $('#request-url').trigger('change');
            $(document).trigger('init-favorite-url-dropdown-items', false);
            $('.btn-toggle-favorite-url').prop('disabled', false);
        }
    );

    $('.btn-toggle-favorite-url').on('click', function(){
        var url = $('#request-url').val();
        if(url == '')
        {
            return false;
        }
        var idx = _.indexOf(favoriteUrls, url);
        if(idx >= 0)
        {
            _.remove(favoriteUrls, function(item) {
                return item == url;
            });
        }
        else
        {
            favoriteUrls.push(url);
        }
        $(document).trigger('init-favorite-url-dropdown-items', true);
        $('.btn-toggle-favorite-url i').toggleClass('fa-star-o');
        $('.btn-toggle-favorite-url i').toggleClass('fa-star');
    });

    $(document).on('change', '#request-url', function(){
        // console.log('request url changed');
        var url = $('#request-url').val();
        // console.log(url);
        if(url == '')
        {
            $('.btn-toggle-favorite-url').prop('disabled', true);
            $('.btn-toggle-favorite-url i').addClass('fa-star-o').removeClass('fa-star');
            return false;
        }
        $('.btn-toggle-favorite-url').prop('disabled', false);
        $('.btn-toggle-favorite-url i').removeClass('fa-star-o fa-star');
        var idx = _.indexOf(favoriteUrls, url);
        if(idx >= 0)
        {
            $('.btn-toggle-favorite-url i').addClass('fa-star');
        }
        else
        {
            $('.btn-toggle-favorite-url i').addClass('fa-star-o');
        }
    });


    $(document).on('init-favorite-url-dropdown-items', function(e, saveToStorage){
        $('#request-urls-dropdown').empty();
        // console.log(favoriteUrls);
        if(typeof favoriteUrls == 'object' && favoriteUrls.length > 0)
        {
            _.forEach(favoriteUrls, function(url) {
                var el = $('<a class="dropdown-item" href="#"></a>').text(url);
                $('#request-urls-dropdown').append(el);
            });
        }
        else
        {
            var li = $('<a class="dropdown-item disabled" href="#">No favorite URLs</a>');
            $('#request-urls-dropdown').append(li);
        }
        if(saveToStorage)
        {
            browser.storage.local.set({ ['request-urls'] : favoriteUrls }).then(() => {
                // console.log(favoriteUrls);
            });
        }
    });

    $(document).on('click', '#request-urls-dropdown .dropdown-item', function(){
        var url = $(this).text();
        $('#request-url').val(url).trigger('change');
    });

    /********************** Init Request Headers **************************/
    $('.nav-custom-header, .nav-custom-header-clear').addClass('disabled');
    browser.storage.local.get('request-headers').then(
        (data) => {
            console.log(data);
            if(data['request-headers'] && data['request-headers'].length > 0)
            {
                window.favoriteHeaders = data['request-headers'];
            }
            $(document).trigger('init-favorite-headers-dropdown-items', false);
            $('.nav-custom-header, .nav-custom-header-clear').removeClass('disabled');
        }
    );

    $(document).on('init-favorite-headers-dropdown-items', function(e, saveToStorage){
        $('.di-favorite-header, .di-favorite-divider').remove();
        // console.log(favoriteUrls);
        if(typeof favoriteHeaders == 'object' && favoriteHeaders.length > 0)
        {
            $('<div class="dropdown-divider di-favorite-divider"></div>')
                .insertAfter('.nav-custom-header');
            _.forEach(favoriteHeaders, function(header) {
                var el = $('<a class="dropdown-item di-favorite-header" href="#"></a>')
                            .text(header.name + ': ' + header.value)
                            .data('name', header.name)
                            .data('value', header.value)
                            .attr('title', header.name + ': ' + header.value);
                el.insertAfter('.di-favorite-divider');
            });
        }
        if(saveToStorage)
        {
            browser.storage.local.set({ ['request-headers'] : favoriteHeaders }).then(() => {
            });
        }
    });

    $(document).on('click', '.nav-custom-header', function(){
        $('#modal-header').modal('show');
    });

    $('#modal-header').on('shown.bs.modal', function(){
        $('#request-header-name').focus().select();
    });
    $('#modal-header').on('hide.bs.modal', function(){
        $('#modal-header').removeData('source');
        $('#save-request-header-favorite').removeAttr('checked').prop('checked', false);
    });

    $(document).on('submit', '.form-request-header', function(e){
        e.preventDefault();
        var requestName = $('#request-header-name').typeahead('val');
        var requestValue = $('#request-header-value').typeahead('val');
        var favorite = ($('#save-request-header-favorite:checked').length == 1);
        var source = $('#modal-header').data('source');
        $(document).trigger('append-request-header', [requestName, requestValue, favorite, source]);
        $('#modal-header').modal('hide');
        if(favorite)
        {
            var result = _.find(favoriteHeaders, { 'name': requestName, 'value': requestValue });
            if(typeof result == 'undefined')
            {
                favoriteHeaders.push({ 'name': requestName, 'value': requestValue });
                $(document).trigger('init-favorite-headers-dropdown-items', true);
            }
        }
        else
        {
            var result = _.remove(favoriteHeaders, function(item){
                console.log(requestName);
                console.log(requestValue);
                console.log(item);
                return item.name == requestName && item.value == requestValue;
            });
            console.log(result);
            console.log(favoriteHeaders);
            if(result.length > 0)
            {
                $(document).trigger('init-favorite-headers-dropdown-items', true);
            }
        }
    });

    $(document).on('click', '.nav-custom-header-clear', function() {
        favoriteHeaders = [];
        $(document).trigger('init-favorite-headers-dropdown-items', true);
        $('.di-favorite-header, .di-favorite-divider').remove();
        toastr.success('All favorite request headers are removed.');
    });

    $(document).on('click', '.btn-remove-header', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var badge = $(this).parents('.badge');
        if($('.btn-remove-header').length == 1)
        {
            $('.div-request-headers').addClass('animated zoomOutRight');
            setTimeout(function(){
                badge.remove();
                $('.div-request-headers').hide();
                $('.div-request-headers').removeClass('animated zoomOutRight');
            }, 750);
        }
        else
        {
            badge.removeClass('animated zoomIn');
            badge.addClass('animated zoomOutRight');
            setTimeout(function(){
                badge.remove();
            }, 750);
        }
    });

    $(document).on('click', '.btn-remove-all-headers', function() {
        $('.div-request-headers').addClass('animated zoomOutRight');
        setTimeout(function(){
            $('.list-request-headers').empty();
            $('.div-request-headers').hide();
            $('.div-request-headers').removeClass('animated zoomOutRight');
        }, 750);
    });

    $(document).on('append-request-header', function(e, name, value, favorite, source){
        console.log('append request: ' + name + ',' + value);
        var closer = $('<a href="javascript:;" class="btn-remove-header">x</a>');
        var el = $('<span class="badge custom badge-default p-2"></span>')
            .text(name + ': ' + value)
            .append(closer)
            .data('name', name)
            .data('value', value)
            .data('favorite', favorite);
        if(source)
        {
            source.replaceWith(el);
        }
        else
        {
            if($('.btn-remove-header').length == 0)
            {
                $('.list-request-headers').append(el);
                $('.div-request-headers').show();
                $('.div-request-headers').addClass('animated zoomInLeft');
                setTimeout(function(){
                    $('.div-request-headers').removeClass('animated zoomInLeft');
                }, 750);
            }
            else
            {
                $('.list-request-headers').append(el.addClass('animated zoomIn'));
            }
        }
    });

    $(document).on('click', '.di-favorite-header', function(){
        var name = $(this).data('name');
        var value = $(this).data('value');
        var favorite = true;
        $(document).trigger('append-request-header', [name, value, favorite]);
    });

    $(document).on('click', '.list-request-headers .badge.custom', function() {
        var name = $(this).data('name');
        var value = $(this).data('value');
        var favorite = $(this).data('favorite');
        $('#request-header-name').typeahead('val', name);
        $(document).trigger('update-request-header-value-typeahead', name);
        $('#request-header-value').typeahead('val', value);
        if(favorite)
        {
            $('#save-request-header-favorite').attr('checked', true).prop('checked', true);
        }
        else
        {
            $('#save-request-header-favorite').removeAttr('checked').prop('checked', false);
        }
        $('#modal-header').data('source', $(this)).modal('show');
    });

    var requestHeaderNames = _.keys(requestHeaders);
    var thNames = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: requestHeaderNames
    });

    // init typeahead for request name
    var thValues = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: []
    });
    $('#request-header-value').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'values',
      source: thValues
    });

    $('#request-header-name').typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    },
    {
      name: 'names',
      source: thNames
    }).on('typeahead:select typeahead:autocomplete', function(src, name){
        $(document).trigger('update-request-header-value-typeahead', name);
    });

    $(document).on('update-request-header-value-typeahead', function(e, name) {
        try{ $('#request-header-value').typeahead('destroy'); }catch(e){}
        var values = [];
        if(name && typeof requestHeaders[name] != 'undefined')
        {
            values = requestHeaders[name];
        }
        var thValues = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.whitespace,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          local: values
        });
        $('#request-header-value').typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        },
        {
          name: 'values',
          source: thValues
        });
    });

    /*********************** Toggle Panel ***************************/
    $(document).on('click', '.btn-toggle-panel', function(){
        var text = $(this).find('span').text();
        if(text == '-')
        {
            $(this).parents('.row').next().hide();
            $(this).find('span').text('+');
        }
        else
        {
            $(this).parents('.row').next().show();
            $(this).find('span').text('-');
        }
    });
    $(document).on('click', '[data-action="toggle"]', function(){
        var target = $(this).data('target');
        if(target == '')
        {
            $('.request-container, .response-container').show();
        }
        else
        {
            $('.' + target).toggle();
        }
    });

    /******************** Back to Top *************************/
    $(window).scroll(function(){
        if($(this).scrollTop() > 100){
            $('#scroll').fadeIn();
        }else{
            $('#scroll').fadeOut();
        }
    });
    $('#scroll').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });
});