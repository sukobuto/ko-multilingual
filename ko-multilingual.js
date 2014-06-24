;(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD anonymous module
		define(["knockout"], factory);
	} else {
		// No module loader (plain <script> tag) - put directly in global namespace
		factory(window.ko);
	}
})(function(ko) {
	var contextKey = 'ko.messageContext';
    
    ko.bindingHandlers['messageContext'] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var context = {
                messages: valueAccessor(),
                placeholderSyntax:
                    ko.utils.extend(
                        {
                            start: '{{',
                            end: '}}'
                        },
                        allBindings.get('placeholderSyntax')
                    )
            };
            ko.utils.domData.set(element, contextKey, context);
        }
    };
    
    ko.bindingHandlers['message'] = {
        init: cacheContextIntoElement,
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var message = processMessage(
                ko.utils.domData.get(element, contextKey),
                valueAccessor(),
                allBindings.get('placeholders'),
                allBindings.get('converters')
            );
            ko.bindingHandlers.text.update(element, function() { return message });
        }
    };
    ko.virtualElements.allowedBindings['message'] = true;
    
    ko.bindingHandlers['htmlMessage'] = {
        init: cacheContextIntoElement,
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var message = processMessage(
                ko.utils.domData.get(element, contextKey),
                valueAccessor(),
                allBindings.get('placeholders'),
                allBindings.get('converters')
            );
            ko.utils.setHtml(element, message);
        }
    };
    ko.virtualElements.allowedBindings['htmlMessage'] = true;
    
    ko.bindingHandlers['attrMessage'] = {
        init: cacheContextIntoElement,
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor()) || {},
                context = ko.utils.domData.get(element, contextKey),
                placeholders = allBindings.get('placeholders'),
                converters = allBindings.get('converters'),
                processed = {};
            ko.utils.objectForEach(value, function(attrName, attrMessageKey) {
                processed[attrName] = processMessage(
                    context,
                    attrMessageKey,
                    placeholders,
                    converters
                );
            });
            ko.bindingHandlers.attr.update(element, function() { return processed });
        }
    };
    
    function cacheContextIntoElement(element) {
        var messages = findContext(element);
        if (!messages) {
            throw new Error("Unable to get the message context.");
        }
        ko.utils.domData.set(element, contextKey, messages);
    }
    
    function findContext(element) {
        var context = ko.utils.domData.get(element, contextKey);
        if (context) return context;
        var parent = element.parentNode;
        if (parent) return findContext(parent);
        return undefined;
    }
    
    function processMessage(context, key, placeholders, converters) {
        var message = ko.unwrap(context.messages)[key],
            _s = context.placeholderSyntax.start,
            _e = context.placeholderSyntax.end;
        if (!message) {
            throw new Error("Message " + key + " not found in the message context");
        }
        converters = converters || {};
        ko.utils.objectForEach(placeholders, function(key, value) {
            value = ko.unwrap(value);
            if (converters[key]) {
                value = converters[key](ko.unwrap(value));
            }
            message = message.replace(new RegExp(_s + key + _e), value);
        });
        return message;
    }
    
    var preprocessNode = ko.bindingProvider.instance.preprocessNode;
    ko.bindingProvider.instance.preprocessNode = function(node) {
        if (node.nodeType == 3) {
            var match = node.nodeValue.match(/{{msg#(\S+)\s*(\[(\S+)+\])?\s*(\[(\S+)+\])?\s*}}/);
            
            if (match) {
                var key = match[1],
                    placeholders = match[3],
                    converters = match[5];
                var c1text = "ko message: '" + key + "'";
                if (placeholders) {
                    c1text += ", placeholders: { " + placeholders + " }";
                }
                if (converters) {
                    c1text += ", converters: { " + converters + " }";
                }
                var c1 = document.createComment(c1text),
                    c2 = document.createComment('/ko');
                node.parentNode.insertBefore(c1, node);
                node.parentNode.replaceChild(c2, node);
                return [c1, c2];
            }
        }
        if (preprocessNode) {
            return preprocessNode(node);
        }
    }
});
