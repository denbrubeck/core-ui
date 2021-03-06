/**
 * Developer: Ksenia Kartvelishvili
 * Date: 04.03.2015
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import 'lib';
import BaseCollectionEditorView from './base/BaseCollectionEditorView';
import RadioButtonView from './impl/radioGroup/views/RadioButtonView';
import RadioGroupCollection from './impl/radioGroup/collections/RadioGroupCollection';
import formRepository from '../formRepository';
import keyCode from '../../utils/keyCode';
const defaultOptions = {
    radioOptions: [{ id: '', displayText: '' }]
};

/**
 * @name RadioGroupEditorView
 * @memberof module:core.form.editors
 * @class Радио-группа. Возможно выбрать одно значение из возможных
 * (аналогично {@link module:core.form.editors.DropdownEditorView DropdownEditorView}). Тип данных редактируемого значения должен
 * совпадать с типом данных поля <code>id</code> элементов массива <code>radioOptions</code>.
 * @extends module:core.form.editors.base.BaseEditorView
 * @param {Object} options Options object. All the properties of {@link module:core.form.editors.base.BaseEditorView BaseEditorView} class are also supported.
 * @param {Array} options.radioOptions Массив объектов <code>{ id, displayText, displayHtml, title }</code>, описывающих радио-кнопки.
 * */
formRepository.editors.RadioGroup = BaseCollectionEditorView.extend(/** @lends module:core.form.editors.RadioGroupEditorView.prototype */{
    initialize: function (options) {
        if (options.schema) {
            _.extend(this.options, defaultOptions, _.pick(options.schema, _.keys(defaultOptions)));
        } else {
            _.extend(this.options, defaultOptions, _.pick(options || {}, _.keys(defaultOptions)));
        }

        this.collection = new RadioGroupCollection(this.options.radioOptions);
    },

    className: 'fd-radio-group',

    childView: RadioButtonView,

    events: {
        keydown: '__onKeyDown'
    },

    collectionEvents: {
        'select:one': '__onSelectChild'
    },

    childViewOptions: function () {
        return {
            selected: this.getValue(),
            enabled: this.getEnabled() && !this.getReadonly()
        };
    },

    __onSelectChild: function (model) {
        this.__value(model.get('id'), true);
    },

    setValue: function (value) {
        this.__value(value, false);
    },

    __setEnabled: function (enabled) {
        BaseCollectionEditorView.prototype.__setEnabled.call(this, enabled);
        var isEnabled = this.getEnabled() && !this.getReadonly();
        this.children.each(function (cv) {
            cv.setEnabled(isEnabled);
        }.bind(this));
    },

    __setReadonly: function (readonly) {
        BaseCollectionEditorView.prototype.__setReadonly.call(this, readonly);
        var isEnabled = this.getEnabled() && !this.getReadonly();
        this.children.each(function (cv) {
            cv.setEnabled(isEnabled);
        }.bind(this));
        if (this.getEnabled()) {
            this.$el.prop('tabindex', readonly ? -1 : 0);
        }
    },

    __value: function (value, triggerChange) {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.collection.findWhere({ id: value }).select();
        if (triggerChange) {
            this.__triggerChange();
        }
    },

    __onKeyDown(event) {
        let direction;
        switch (event.keyCode) {
            case keyCode.DOWN:
                direction = 1;
                break;
            case keyCode.UP:
                direction = -1;
                break;
            default:
                direction = 0;
        }
        if (direction !== 0) {
            this.__selectNew(direction);
            event.preventDefault();
        }
    },

    __selectNew(direction) {
        const currentElement = this.collection.selected;
        const currentIndex = currentElement ? this.collection.indexOf(currentElement) : -1;
        let newElement = this.collection.at(currentIndex + direction);
        if (!newElement) {
            newElement = direction === 1 ? this.collection.at(0) : this.collection.last();
        }
        newElement.select();
    }
});

export default formRepository.editors.RadioGroup;
