

;(function($) {

$(document).ready( function() {

	enabled_languages = sp_multilingual.enabled;
	all_languages = sp_multilingual.languages;
	current_lang = sp_multilingual.current;
	default_language = sp_multilingual.default;

	// multilingual admin menu

	function sp_ml_opt_langs_insert( lang ) {
		$lang_one = $( '<tr class="lang_one">' + $('#sp_ml_opt_langs_list .lang_one.sp_list_one_tpl').html() + '</tr>' );
		if ( -1 != $.inArray( lang['locale_code'], enabled_languages ) || lang['enabled'] )
			$lang_one.addClass('enabled');
		if ( default_language == lang['locale_code'] )
			$lang_one.addClass('default');
		$lang_one.attr({ 'locale_code': lang['locale_code'] });
		$lang_one.find('.lang_flag img:first').attr( 'src', lang['flag'] );
		$lang_one.find('.lang_name').text( lang['name'] ) ;
		$lang_one.appendTo('#sp_ml_opt_langs_list');
	}
	for ( locale_code in enabled_languages ) {
		locale_code = enabled_languages[locale_code];
		if ( 'undefined' != typeof all_languages[locale_code] ) {
			l = all_languages[locale_code];
			l['locale_code'] = locale_code;
			sp_ml_opt_langs_insert( l );
		}
	}
	$('#sp_ml_opt_langs_list .lang_one').prepend('<td class="lang_ctrl_drag"><span class="sp-drag-icon sp-ml-opt-drag"></span></td>');
	$('#sp_ml_opt_langs_list > tbody').sortable( { 'handle': '.sp-ml-opt-drag:first', axis: 'y' } );
	$('#sp_ml_opt_langs_list .btn_lang_one_delete').live( 'click', function(e) {
		e.preventDefault();
		$(this).parents('.lang_one').remove();
	} );
	$('#sp_ml_opt_langs_list .btn_lang_one_set_default').live( 'click', function(e) {
		e.preventDefault();
		$('#sp_ml_opt_langs_list .lang_one').removeClass('default');
		$(this).parents('.lang_one').addClass('default');
	} );
	$('#lang_add .btn_lang_add_add').live( 'click', function(e) {
		e.preventDefault();
		locale_code = $('#lang_add_name').val();
		if ( 0 == $('#sp_ml_opt_langs_list .lang_one').filter('[locale_code="'+locale_code+'"]').length && 'undefined' != typeof all_languages[locale_code] )
			sp_ml_opt_langs_insert( {
				'locale_code' : locale_code,
				'flag'        : all_languages[locale_code]['flag'],
				'name'        : all_languages[locale_code]['name'],
				'enabled'     : true,
			} );
	} );
	$('form#sp-ml-settings').bind( 'submit', function(e) {
		// generate field data
		var field_enabled = [],
			field_default = '';
		$('#sp_ml_opt_langs_list .lang_one').not('.sp_list_one_tpl').each( function() {
			if ( $(this).hasClass('enabled') )
				field_enabled.push( $(this).attr('locale_code') );
			if ( $(this).hasClass('default') )
				field_default = $(this).attr('locale_code');
		} );
		// generate fields HTML and append to form
		if ( field_enabled.length )
			for ( l in field_enabled )
				$(this).append('<input name="sp_ml_opt_main[enabled][]" type="hidden" value="'+field_enabled[l]+'" />');
		else
			$(this).append('<input name="sp_ml_opt_main[enabled]" type="hidden" value="" />');
		if ( field_default )
			$(this).append('<input name="sp_ml_opt_main[default]" type="hidden" value="'+field_default+'" />');
		else
			$(this).append('<input name="sp_ml_opt_main[default]" type="hidden" value="" />');
	} );

	// custom meta

	$('.sp-cm-one .sp-ml-lang-tabs a').click( function(e) {
		e.preventDefault();
		sp_ml_switch_field_lang( $(this).parents('.sp-cm-one'), $(this).data('lang') );
		$field_to_focus = $(this).parents('.sp-cm-one')
			.find('.sp-cm-one-field-l-'+$(this).data('lang'))
			.find('input[type="text"], textarea');
		if ( $field_to_focus.length )
			$field_to_focus[0].focus();
	} );

	// options panel

	$('#sp-options-panel-header .sp-ml-lang-tabs a, #sp-options-panel-footer .sp-ml-lang-tabs a')
		.removeClass('current')
		.filter('.sp-ml-lang-tab-'+current_lang).addClass('current');
	sp_ml_switch_field_lang( $('.sp-cm-one'), current_lang );

	$('#sp-options-panel-header .sp-ml-lang-tabs a, #sp-options-panel-footer .sp-ml-lang-tabs a').click( function(e) {
		e.preventDefault();
		$('#sp-options-panel-header .sp-ml-lang-tabs a, #sp-options-panel-footer .sp-ml-lang-tabs a')
			.removeClass('current')
			.filter('.sp-ml-lang-tab-'+$(this).data('lang')).addClass('current');
		sp_ml_switch_field_lang( $('#sp-options-panel-wrap .sp-cm-one'), $(this).data('lang') );
	} );

	// post custom meta

	;

	// post edit

	if ( $('form#post').length ) {
		if ( $('.sp-pe-one-field-post_title-l').length ) {
			$('form#post').find('#title').hide();
			$('#titlewrap').append( $('.sp-pe-one-field-post_title-l') );
		}
		if ( $('.sp-pe-one-field-post_content-l').length ) {
			$('form#post').find('#wp-content-wrap').hide();
			$('#postdivrich').prepend( $('.sp-pe-one-field-post_content-l') );
		}
		if ( $('.sp-pe-one-field-post_excerpt-l').length ) {
			$('form#post').find('#excerpt').hide();
			$('#postexcerpt .inside').prepend( $('.sp-pe-one-field-post_excerpt-l') );
		}
	}

	$('#sp-pe-multilingual-selector a').click( function(e) {
		e.preventDefault();
		lang = $(this).data('lang');
		$('#sp-pe-multilingual-selector a')
			.removeClass('current')
			.filter('.sp-ml-lang-tab-'+lang).addClass('current');
		$('.sp-pe-one-field-post_title-l, .sp-pe-one-field-post_content-l, .sp-pe-one-field-post_excerpt-l').hide()
			.filter('.sp-pe-one-field-l-'+lang).show();
		$('.sp-cm-one').each( function() {
			sp_ml_switch_field_lang( $(this), lang );
		} );
	} );

	$('#sp-pe-multilingual-selector .sp-ml-lang-tab-'+current_lang).trigger('click');

	// term add & term edit

	if ( $('form#addtag').length ) {
		if ( $('.sp-te-one-field-name-l').length ) {
			$('form#addtag #tag-name').hide();
			$('#tag-name').after( $('.sp-te-one-field-name-l') );
		}
		if ( $('.sp-te-one-field-description-l').length ) {
			$('form#addtag #tag-description').hide();
			$('#tag-description').after( $('.sp-te-one-field-description-l') );
		}
		if ( $('.sp-te-one-field-name-l').length )
			$('form#addtag').before( $('.sp-te-multilingual-selector') );
	}

	if ( $('form#edittag').length ) {
		if ( $('.sp-te-one-field-name-l').length ) {
			$('form#edittag #name').hide();
			$('#name').after( $('.sp-te-one-field-name-l') );
		}
		if ( $('.sp-te-one-field-description-l').length ) {
			$('form#edittag #description').hide();
			$('#description').after( $('.sp-te-one-field-description-l') );
		}
		$('form#edittag .form-table:first > tbody').prepend('<tr><td colspan="2"></td></tr>').find('td:first').append($('.sp-te-multilingual-selector'));
	}

	$('.sp-te-multilingual-selector a').click( function(e) {
		e.preventDefault();
		lang = $(this).data('lang');
		$('.sp-te-multilingual-selector a')
			.removeClass('current')
			.filter('.sp-ml-lang-tab-'+lang).addClass('current');
		$('.sp-te-one-field-name-l, .sp-te-one-field-description-l').hide()
			.filter('.sp-te-one-field-l-'+lang).show();
		$('.sp-cm-one').each( function() {
			sp_ml_switch_field_lang( $(this), lang );
		} );
	} );

	$('.sp-te-multilingual-selector .sp-ml-lang-tab-'+current_lang).trigger('click');

	$('[name="name__'+default_language+'"]').bind( 'change', function(e) {
		$('[name="tag-name"]').val( $(this).val() );
	} );

} );

$(window).load( function() {

} );

})(jQuery);


function sp_ml_switch_field_lang( $field, lang ) {
	// switch link style
	$field.find('.sp-ml-lang-tabs a')
		.removeClass('current')
		.filter('.sp-ml-lang-tab-'+lang).addClass('current');
	// switch field language
	$field.find('.sp-cm-one-field-l').hide()
		.filter('.sp-cm-one-field-l-'+lang).show();
}

