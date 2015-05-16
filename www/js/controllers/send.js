/*global angular*/
(function withAngular(angular) {
  'use strict';

  angular.module('Send.controller', [])
  .controller('SendCtrl', ['$rootScope', '$scope', '$window', '$log', '$stateParams', '$filter', 'BitCoin', 'CordovaClipboard',
    function SendCtrlController($rootScope, $scope, $window, $log, $stateParams, $filter, BitCoin, CordovaClipboard) {

    var onNFCTag
      , inputToAddressElement = $window.document.getElementById('toAddress');
    $scope.sendForm = {};
    $scope.publicAddress = BitCoin.address;
    $scope.sendForm.toAddress = $stateParams.nfcAddress || undefined;
    // $scope.sendForm.toAddress = '1antani';
    // $scope.sendForm.toAddress = '197GxXSqqSAkhLXyy9XrtEySvssuDcQGMY';
    // $scope.sendForm.outputAmount = Number('1000'); // FIXME - use amount from ng-model
    if ($scope.sendForm.toAddress) {

      inputToAddressElement.focus();
    }

    $scope.resetFlags = function resetLayoutFlags() {

      $scope.errorText = undefined;
      $scope.successText = undefined;
    };

    $scope.waitNFCTag = function waitNFCTag() {

      $scope.waitingNFC = true;
    };

    $scope.sendBtc = function sendBtc() {

      if (!$scope.sending) {

        var amountSatoshi = $filter('UnitConvert')(Number($scope.sendForm.outputAmount), 'mbtcToSatoshis');

        $scope.resetFlags();
        $scope.sending = true;

        $log.log('amount: ' + Number($scope.sendForm.outputAmount) + ', address: ' + $scope.sendForm.toAddress);

        BitCoin.send(amountSatoshi, $scope.sendForm.toAddress).then(function onSent(response) {

          $log.log('SENT');
          $log.log('response: ' + response.data);


          // FIXME : never reaches here vvvv


          $scope.sending = undefined;
          $scope.successText = 'Payment sent.';
          $scope.errorText = false;
          // TODO: FIX bugs - icona rimane sending... con lo spinner
          // la view si dovrebbe refreshare cosi' che riaggiorna il balance (deve diminuire dopo aver inviato i btc)
        }).catch(function onError(error){

          $log.log('catched error: ' + error.message);

          $scope.errorText = error.message;
          $scope.successText = false;
          $scope.sending = undefined;
        });
      }
    };

    $scope.copyFromClipboard = function copyFromClipboard() {

      $scope.resetFlags();
      $scope.copied = false;

      CordovaClipboard.paste().then(function onPaste(clipboardText) {

        if (clipboardText &&
          clipboardText.match(/^[13][^O0Il]{25,33}/)) {

          $scope.sendForm.toAddress = clipboardText;
          $scope.copied = true;
        } else {

          $scope.copied = false;
          $scope.errorText = 'Clipboard doesn\'t cointain an address.';
          $log.error('Clipboard doesn\'t cointain an address.');
        }

      }).catch(function onCopyError(error) {

        $log.error('Unable to copy to clipboard', error);
      });

    };

    BitCoin.balance().then(function onBalance(balance) {

      $scope.balance = balance;
    });

    onNFCTag = $rootScope.$on('nfc:status-message', function onNFCTag() {

      $scope.waitingNFC = undefined;
    });

    $scope.$on('$destroy', function () {

      onNFCTag();
    });
  }]);
}(angular));
