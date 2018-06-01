({
	initHelperUtilitiesBase : function(cmp, event, helper) {
		//To provide wrapper and value methods
		helper.each(helper.functions(helper), (name) => { 
			var func = helper[name];
			helper.wrapper.prototype[name] = function() {
				var args = helper.reduce(arguments, helper.push, [this._wrapped]);
		        return helper.chain(func.apply(null, args));
	      	};
		});
		if(!helper.wrapper.prototype.value){
			//Extracts the value of a wrapped object
			helper.wrapper.prototype.value = function(){ 
				return this._wrapped; 
			};
		}
	}
})