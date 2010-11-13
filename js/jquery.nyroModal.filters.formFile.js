/*
 * nyroModal v2.alpha
 *
 */
jQuery(function($, undefined) {
	$.nmFilters({
		/*
			depends:
		*/
		formFile: {
			is: function(nm) {
				var ret = nm.opener.is('form[enctype="multipart/form-data"]');
				if (ret) {
					nm._delFilter('form');
					if (!nm.store.form)
						nm.store.form = nm.getInternal()._extractUrl(nm.opener.attr('action'));
				}
				return ret;
			},
			init: function(nm) {
				nm.loadFilter = 'formFile';
				nm.store.formFileLoading = false;
				nm.opener.unbind('submit.nyroModal').bind('submit.nyroModal', function(e) {
					if (!nm.store.formFileIframe) {
						e.preventDefault();
						nm.opener.trigger('nyroModal');
					} else {
						nm.store.formFileLoading = true;
					}
				});
			},
			initElts: function(nm) {
				function rmIframe() {
					nm.store.formFileIframe.attr('src', 'about:blank').remove();
					nm.store.formFileIframe = undefined;
					delete(nm.store.formFileIframe);
				}
				nm.store.formFileIframe = $('<iframe name="nyroModalFormFile" src="javascript:\'\';"></iframe>')
					.hide()
					.load(function() {
						if (nm.store.formFileLoading) {
							nm.store.formFileLoading = false;
							var content = nm.store.formFileIframe
									.unbind('load error')
									.contents().find('body').not('script[src]');
							if (content && content.html() && content.html().length) {
								rmIframe();
								nm._setCont(content.html(), nm.store.form.sel);
							} else {
								// Not totally ready, try it in a few secs
								var nbTry = 0;
									fct = function() {
										nbTry++;
										var content = nm.store.formFileIframe
												.unbind('load error')
												.contents().find('body').not('script[src]');
										if (content && content.html() && content.html().length) {
											nm._setCont(content.html(), nm.store.form.sel);
											rmIframe();
										} else if (nbTry < 5) {
											setTimeout(fct, 25);
										} else {
											rmIframe();
											nm._error();
										}
									};
								setTimeout(fct, 25);
							}
						}
					})
					.error(function() {
						rmIframe();
						nm._error();
					});
				nm.elts.all.append(nm.store.formFileIframe);
				nm.opener
					.attr('target', 'nyroModalFormFile')
					.submit();
			},
			close: function(nm) {
				nm.store.formFileLoading = false;
				if (nm.store.formFileIframe) {
					nm.store.formFileIframe.remove();
					nm.store.formFileIframe = undefined;
					delete(nm.store.formFileIframe);
				}
			}
		}
	});
});