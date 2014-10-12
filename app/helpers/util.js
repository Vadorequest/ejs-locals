///<reference path='./../lib/def/defLoader.d.ts'/>

/**
* Search for a variable contained in the global scope. If it finds it then it uses it, or fall back using the default value.
* It doesn't add the variable to the global scope.
*
* @param _var
* @param _default
* @return {any}
*/
defined = function (_var, _default) {
    return typeof global[_var] !== 'undefined' ? global[_var] : _default;
};

/**
* Search for a variable contained in the global scope. If it finds it then it uses it, or fall back using the default value.
* I DID NOT TEST IT. I GUESS THIS WOULD BE AVAILABLE FOR THE WHOLE LIFECYCLE OF THE PROGRAM, NEED ANOTHER PAIR OF EYES ON THAT.
*
* @param _var
* @param _default
* @return {any}
*/
definedAndSet = function (_var, _default) {
    return typeof global[_var] !== 'undefined' ? global[_var] : global[_var] = _default;
};
