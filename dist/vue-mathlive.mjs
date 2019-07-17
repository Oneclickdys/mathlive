var t={name:"mathlive-mathfield",template:'<div class="mathfield" :id="id"><slot></slot></div>',props:{id:{type:String,default:""},value:{type:String,default:""},config:{type:Object,default:()=>({})},onKeystroke:{type:Function,default:function(t,e){return!0}},onMoveOutOf:{type:Function,default:function(t){return!0}},onTabOutOf:{type:Function,default:function(t){return!0}}},install:function(t,e){Object.defineProperty(t.prototype,"$mathlive",{value:e}),t.component("mathlive-mathfield",this)},watch:{value:function(t,e){t!==e&&this.$el.mathfield.latex(t,{suppressChangeNotifications:!0})},config:{deep:!0,handler:function(t){this.$el.mathfield.$setConfig(t)}}},mounted:function(){const t=this;this.$nextTick(function(){t.$mathlive.makeMathField(t.$el,{...t.config,onContentDidChange:e=>{t.$emit("input",t.$el.mathfield.latex())},onFocus:e=>{t.$emit("focus")},onBlur:e=>{t.$emit("blur")},onContentWillChange:e=>{t.$emit("content-will-change")},onSelectionWillChange:e=>{t.$emit("selection-will-change")},onUndoStateWillChange:(e,n)=>{t.$emit("undo-state-will-change",n)},onUndoStateDidChange:(e,n)=>{t.$emit("undo-state-did-change",n)},onVirtualKeyboardToggle:(e,n,i)=>{t.$emit("virtual-keyboard-toggle",n,i)},onReadAloudStatus:(e,n)=>{t.$emit("read-aloud-status",n)},onKeystroke:function(e,n,i){return t.onKeystroke(n,i)},onMoveOutOf:(e,n)=>t.onMoveOutOf(n),onTabOutOf:(e,n)=>t.onTabOutOf(n)})})},methods:{perform:function(t){this.$el.mathfield.$perform(t)},hasFocus:function(){return this.$el.mathfield.$hasFocus()},focus:function(){this.$el.mathfield.$focus()},blur:function(){this.$el.mathfield.$blur()},text:function(t){return this.$el.mathfield.$text(t)},selectedText:function(t){return this.$el.mathfield.$selectedText(t)},insert:function(t,e){this.$el.mathfield.$insert(t,e)},keystroke:function(t,e){return this.$el.mathfield.$keystroke(t,e)},typedText:function(t){this.$el.mathfield.$keystroke(t)},selectionIsCollapsed:function(){return this.$el.mathfield.$selectionIsCollapsed()},selectionDepth:function(){return this.$el.mathfield.$selectionDepth()},selectionAtStart:function(){return this.$el.mathfield.$selectionAtStart()},selectionAtEnd:function(){return this.$el.mathfield.$selectionAtEnd()},select:function(){this.$el.mathfield.$select()},clearSelection:function(){this.$el.mathfield.$clearSelection()}}};export default t;
