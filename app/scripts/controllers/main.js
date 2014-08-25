'use strict';

/**
 * @ngdoc function
 * @name tsviewerDemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tsviewerDemoApp
 */
angular.module('tsviewerDemoApp')
  .controller('MainCtrl', function ($scope,$http,CreateMDXQuery,MDXQuery) {
        //Create a new Saiku session
        console.log("Creating saiku session...");
        $http({method: 'POST',
            url: '/saiku4/rest/saiku/session',
            data: 'username=admin&password=admin',
            headers: {Accept:'application/json, text/javascript, */*; q=0.01','Content-Type':'application/x-www-form-urlencoded'}
        }).
            success(function() {
                $http({method: 'GET',
                    url: '/saiku4/rest/saiku/admin/discover/TimeSeriesWithRegionsHadoop/ESECube/ESECube/EseCube/dimensions/Geography/hierarchies/geography/levels/Country'

                    //headers: {Accept:'application/json, text/javascript, */*; q=0.01','Content-Type':'application/x-www-form-urlencoded'}
                }).
                    success(function(data) {
                        console.log(data);
                        $scope.countries = data;
                    });

                console.log("Session created! \n")
                console.log("Creating a new query.");
                CreateMDXQuery.post( {}, 'name=%7B%7D&cube=EseCube&connection=TimeSeriesWithRegionsHadoop&catalog=ESECube&schema=ESECube&formatter=flattened&type=MDX',
                    function(value){
                        console.log("Query created:");
                        console.log(value);
                        $scope.query=value;
                        var postData = 'queryName=1&start=0&limit=10000&mdx=' + encodeURIComponent(generateMDXQuery('regular', {selectedCountryCode:140}, 2006));
                        MDXQuery.post( {}, postData,
                            function(value, responseHeaders){
                                $scope.data=value;
                                console.log("Data received:");console.log(value);
                            }
                        );
                    });
            }).
            error(function(data, status) {
                console.log(status);
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
  });


function generateMDXQuery(type, serie, year){
    if(type == 'regular'){
        var start = {
            year: year,
            month:1
        }, end = {
            year:  year,
            month: 12
        }
        if(serie.regionPossibility){
            return 'SELECT NON EMPTY { {[Measures].[NDVI]} * Hierarchize({[Geography].[geography].[' + serie.selectedCountryCode + '].[' + serie.selectedRegionCode + ']})} ON COLUMNS, NON EMPTY {Hierarchize({Filter({{[Time].[Yearly].[Month].Members}}, (Exists(Ancestor([Time].[Yearly].CurrentMember, [Time].[Yearly].[Year]), {[Time].[Yearly].[2006]}).Count  > 0))})} ON ROWS FROM [EseCube]';
        }else{
            return 'SELECT NON EMPTY { {[Measures].[NDVI]} * Hierarchize({[Geography].[Country].&[' + serie.selectedCountryCode + ']})} ON COLUMNS, NON EMPTY {{Hierarchize({[Time].[Yearly].[' + start.year + '].[' + start.month + ']:[Time].[Yearly].[' + end.year + '].[' + end.month + ']})} } ON ROWS FROM [EseCube]';
        }
    }else if(type == 'extrema'){
        if(serie.regionPossibility){
            return 'SELECT NON EMPTY {[Geography].[Region].&[' + serie.selectedRegionCode + ']}*{[Measures].[NDVI MAX],[Measures].[NDVI MIN]} ON COLUMNS, NON EMPTY {[MonthlyTime].[Month].Members} ON ROWS FROM [LTACube]';
        }else{
            return 'SELECT NON EMPTY { {[Geography].[Country].&[' + serie.selectedCountryCode + ']}}*{[Measures].[NDVI MAX],[Measures].[NDVI MIN]} ON COLUMNS, NON EMPTY {[MonthlyTime].[Month].Members} ON ROWS FROM [LTACube]';
        }
    }else if(type == 'avg'){
        if(serie.regionPossibility){
            return 'SELECT NON EMPTY {Hierarchize({[Geography].[Country].[geography].[' + serie.selectedCountryCode + '].[' + serie.selectedRegionCode + ']}* {[Measures].[NDVI]})} ON COLUMNS, {Hierarchize({[Time].[Month of Year].Members})} ON ROWS FROM [EseCube]';
        }else{
            return 'SELECT NON EMPTY {Hierarchize({[Geography].[Country].&[' + serie.selectedCountryCode + ']}* {[Measures].[NDVI]})} ON COLUMNS, {Hierarchize({[Time].[Month of Year].Members})} ON ROWS FROM [EseCube]';
        }
    }else{
        return '';
    }
}