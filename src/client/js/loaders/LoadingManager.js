/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function (onStart, onProgress, onLoad, onError ) {

	var scope = this,
        loaded = 0,
        total = 0;

	this.onLoad = onLoad;
	this.onProgress = onProgress;
	this.onError = onError;

	this.itemStart = function ( url ) {
		total ++;
        onStart && onStart(url);
	};

	this.itemEnd = function ( url ) {

		loaded ++;

		if ( scope.onProgress !== undefined ) {

			scope.onProgress( url, loaded, total );

		}

		if ( loaded === total && scope.onLoad !== undefined ) {
            loaded = total = 0;
			scope.onLoad();

		}

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
