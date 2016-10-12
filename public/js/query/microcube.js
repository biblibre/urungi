/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 07/07/16
 * Time: 08:33
 * To change this template use File | Settings | File Templates.
 */

app.service('microcube' , function ($http, $q, $filter, connection) {

    this.mergeData = function($scope, dataset1, dataset2, joins) {
        for (var d1 in dataset1)
        {

        }
    }


    this.mergeTwoCollections = function(dataset1,dataset2,dataset1Element,dataset2Element,done)
    {
        var tempResults = [];

        if (dataset1 && dataset2 )
            {
                var largestResult;
                var shortestResult;
                var largestElement;
                var shortestElement;

                if (dataset1.length > dataset2.length)
                {
                    largestResult = dataset1;
                    largestElement = dataset1Element;
                    shortestResult = dataset2;
                    shortestElement = dataset2Element;
                } else {
                    largestResult = dataset2;
                    largestElement = dataset2Element;
                    shortestResult = dataset1;
                    shortestElement = dataset1Element;
                }


                for (var s in largestResult)
                {
                    for (var t in shortestResult)
                    {
                        if (String(largestResult[s][largestElement]) == String(shortestResult[t][shortestElement]))
                        {
                            var tempRecord = {};
                            for (var key in largestResult[s])
                            {
                                tempRecord[key] = largestResult[s][key];
                            }

                            for (var key in shortestResult[t])
                            {
                                tempRecord[key] = shortestResult[t][key];
                            }
                            tempResults.push(tempRecord);
                        }
                    }

                }
            }
        done(tempResults);
        };

});
