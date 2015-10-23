/**
 * Created by verrydtj on 4/03/14.
 */

'use strict';

var services = angular.module('tsviewerDemoApp');

services.factory('MDXQuery', ['$resource',
  function($resource){
    return $resource('/saiku4/rest/saiku/admin/query/1/result/flattened', {}, {
      query: {
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',Accept: '*/*'},
        method:'GET',
        //params:{entryId:''},
        isArray:true
      },
      post: {
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',Accept: '*/*'},
        method:'POST',
        isArray: false
      },
      update: {
        method:'PUT'
        //params: {entryId: '@entryId'}
      },
      remove: {
        method:'DELETE'
      }
    });
  }
]);
