var crypto 		= require( 'crypto' );

var makeHmac = function( iTime, sSalt, sSecret ) {
	return crypto.createHmac( 'sha256', sSecret )
			  	 .update( iTime + sSalt )
				 .digest( 'hex' );
};

var getSecondsSinceEpoc = function() {
	return Math.round( new Date().getTime() / 1000 );
}

var isSecure = function( sAuth, iTime, config ) {
	return sAuth 
		&& sAuth == makeHmac( iTime, config.salt, config.secret );
};

var isTimeValid = function( iTime, config ) {
	return iTime
	 	&& Math.abs( getSecondsSinceEpoc() - iTime ) <= parseInt( config.allowed_interval, 10 );
};

exports.getMiddleware = function( config ) {
	return function( req, res, next ) {
		var iTime	= req.get( config.headers.timestamp  );
		var sAuth	= req.get( config.headers.auth  );

		if( isTimeValid( iTime, config )
		 && isSecure( sAuth, iTime, config ) ) {
			next();
			return;
		}
		res.sendStatus( 403 );
	};
};

exports.getHeaders = function( config ) {
	var iNow   	 =  getSecondsSinceEpoc();
	var oHeaders = {};
	oHeaders[config.headers.timestamp] 	= iNow
	oHeaders[config.headers.auth]		= makeHmac( iNow, config.salt, config.secret )
	return oHeaders;
};