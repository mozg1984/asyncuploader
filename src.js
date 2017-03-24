// for support indexOf (ECMA-262) at IE < 8
if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0); i < this.length; i++) {
            if (this[i] == obj) { return i; }
        }
        return -1;
    }
}

/*
 * @author khisamutdinov radik
 * email mozg1984@gmail.com
 *
 * jQuery plugin for asynchronous uploading
 * files by iframe transport
 *
 */
(function (global, undefined) {
    var module = global.AsyncUploader || {};
    if (typeof module != 'object') {
        throw new Error("Can not import module <AsyncUploader> into global namespace");
    }

    if (jQuery == undefined) {
        throw new Error("jQuery library is required for module <AsyncUploader>, but not found");
    }

    var _$selector = null,
        _$input = $input(),
        _$container = $('<div/>').html(_$input);

    var extensions = "",
        url = "",
        method = "post",
        enctype = "multipart/form-data",
        domInitDelay = 1500;// for dom initializing

    var events = {
        start: function () {},
        complete: function () {},
        extensionError: function () {
            alert("Error: The given file extension is not supported");
        }
    };

    /**
    * Creating <input/> element
    * @returns {object} Jquery dom element
    */
    function $input() {
        return $('<input/>')
            .attr('type', 'file')
            .attr('size', '0')
            .attr('name', 'async-file');
    }

    /**
    * Creating <form/> element  
    * @param {string} target - Value of attribute
    * @returns {object} Jquery dom element
    */
    function $form(target) {
        return $('<form/>')
            .attr('action', url)
            .attr('method', method)
            .attr('enctype', enctype)
            .attr('target', target);
    }

    /**
    * Creating <iframe/> element 
    * @param {string} name - Value of attribute
    * @returns {object} Jquery dom element
    */
    function $iframe(name) {
        return $('<iframe/>')
            .attr('name', name)
            .attr('src', '#');
    }

    /**
    * Checking uploading file extension
    * @returns {boolean}
    */
    function checkExtension() {
        var ext = _$input.val().split('.').pop();// file extension
        if (isArray(extensions) && extensions.indexOf(ext) == -1) {
            _$input.parent().each(function () { this.reset(); });
            return false;
        }
        return true;
    }

    /**
    * Load iframe handler
    * @returns {void}
    */
    function load() {
        var iframe = $(this);
        iframe.next()[0].reset(); // reset the input to not submit a file in the parent form
        var response = iframe.contents().find('body').html();
        events.complete(isJson(response) ? JSON.parse(response) : response);//message from the server, downloaded to the frame		
        _$selector.removeAttr('disabled');
    };

    /**
    * Checking array type
    * @param {Array} array
    * @returns {boolean}
    */
    function isArray(array) {
        return array && Object.prototype.toString.call(array) === '[object Array]';
    }

    /**
    * Checking object type  
    * @param {Object} fn
    * @returns {boolean}
    */
    function isObject(object) {
        return object && Object.prototype.toString.call(object) === '[object Object]';
    }

    /**
    * Checking json format 
    * @param {string} str
    * @returns {boolean}
    */
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
    * Returns a random integer between min (inclusive) and max (inclusive)
    * @param {number} min - Left boundary in number range
    * @param {number} max - Right boundary in number range
    * @returns {number}
    */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
    * Returns an unique id 
    * @param {number} [length=5] - Length of unique id 
    * @returns {string}
    */
    function uniqueId(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', id = '';		
        for (var i = (length || 5); i > 0; --i) id += chars[randomInt(0, chars.length - 1)];
        return id;
    };

    /**
    * Initializing the module
    * @param {object} params - Parameters for initializing
    * @returns {void}
    */
    module.init = function (params) {
        if (!isObject(params)) {
            throw new Error("The given parameters at <AsyncUploader.init> are incorrect");
        }

        _$selector =  $(params.selector).length > 0 
                      ? $(params.selector)
                      : _$selector;

        if (_$selector == null) {
            throw new Error("The selector at <AsyncUploader.init> is undefined");
        }

        url = params.url && ('' + params.url).length > 0
              ? ('' + params.url).replace(/^\s+/, '').replace(/\s+$/, '').replace(/\\+/g, '/')
              : url;

        extensions = isArray(params.extensions) && params.extensions.length > 0 
                     ? params.extensions
                     : extensions;

        events.start = typeof params.start == 'function'
                       ? params.start
                       : events.start;

        events.complete = typeof params.complete == 'function'
                          ? params.complete
                          : events.complete;

        events.extensionError = typeof params.extensionError == 'function'
                                ? params.extensionError
                                : events.extensionError;

        var iframeName = 'async-iframe-' + uniqueId();		

        $('body').append(_$container.hide());

        _$input.before($iframe(iframeName))
        .delay(domInitDelay)
        .wrap($form(iframeName));

        _$input.change(function () {
            if (!checkExtension()) {
                events.extensionError();
                return;
            }

            _$selector.attr('disabled', 'disabled');
            events.start();			
            $(this).parent().submit().prev().one('load', load);
        });

        _$selector.click(function () {
            _$input.trigger('click');
        });
    };

    // import module into global namespace
    global.AsyncUploader = module;
})(this);
