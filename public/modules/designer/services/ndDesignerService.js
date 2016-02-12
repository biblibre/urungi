/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 25/04/15
 * Time: 10:12
 * To change this template use File | Settings | File Templates.
 */

app.service('ndDesignerService', function() {
    var inputHTML = '';
    var outputHTML = '';

    var setInputHTML = function(newObj) {
        inputHTML = newObj;
    }

    var getInputHTML = function(){
        return inputHTML;
    }

    var setOutputHTML = function(newObj) {
        outputHTML = newObj;
    }

    var getOutputHTML = function(){
        return outputHTML;
    }


    return {
        setInputHTML: setInputHTML,
        getInputHTML: getInputHTML,
        setOutputHTML: setOutputHTML,
        getOutputHTML: getOutputHTML,
        parameters: {},
        links: []
    };

});
