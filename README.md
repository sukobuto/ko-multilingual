ko-multilingual
===============

KnockoutJS multilingual plugin

## Usage

Define messages in your view model...

```js
function SampleViewModel() {
    var self = this;
    
    // hash of { id -> message }
    self.messages = ko.observable({
        'hello': 'Hello!',
        'welcome_NAME': 'Welcome {name}',
        'NUM_input': 'Please input in <strong>{num}</strong> letters.'
    });
    self.myName = ko.observable('Sukobuto');
    self.myNum = ko.observable(20);
    
    self.changeLanguage = function() {
        self.messages({
            'hello': 'Chao!',
            'welcome_NAME': 'Benvenuto {name}',
            'NUM_input': 'Si prega di inserire in <strong>{num}</strong> lettere.'
        });
    };
}

ko.applyBindings(new SampleViewModel());
```

and bind it in your view.

```html
<section data-bind="messageContext: messages">
    <p>{{msg#hello}}</p>
    <p>{{msg#welcome_NAME [name:myName]}}</p>
    <p data-bind="htmlMessage: 'NUM_input', placeholders: { num: myNum }"></p>
    <hr/>
    <div data-bind="foreach: [10,20,30]">
        <!-- You don't have to care the binding context to get messages. -->
        <p>{{msg#hello}}</p>
        <p data-bind="htmlMessage: 'NUM_input', placeholders: { num: $data }"></p>
    </div>
</section>
```

### About special syntax

You can use special binding syntax for display messages.

```html
{{msg#hello}}
{{msg#welcome_NAME [name:myName]}}
```

same as...

```html
<!--ko message: 'hello'--><!--/ko-->
<!--ko message: 'welcome_NAME', placeholders:{ name: myName }--><!--/ko-->
```

## Live example

http://jsfiddle.net/sukobuto/L8GWD/
