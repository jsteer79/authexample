var auth 		= require( './auth' );
var crypto 		= require( 'crypto' );
var express 	= require( 'express' );
var supertest	= require( 'supertest' );

var config = { salt : ' SomePossiblyNotNeededSalt'
			 , secret: 'SomeResonablyLongSecret'
			 , allowed_interval: 2
			 , headers: { timestamp : 'X-Time'
			 			, auth  	: 'X-Auth'
						}
			 , port: 8080
			 };


var app = express();
app.use( auth.getMiddleware( config ) );
app.get( '/', function( req, res ) {
	res.status( 200 ).send( 'OK' );
} );
app.listen( config.port, function() {
	console.log( 'Listening on port: ' + config.port );

	// Make some testing requests 

	var headers = auth.getHeaders( config );
	console.log( 'Headers: ', headers );

	supertest( 'http://localhost:' + config.port )
		.get( '/' )
		.set( config.headers.timestamp	, headers[config.headers.timestamp] )
		.set( config.headers.auth 		, headers[config.headers.auth] )
		.end( function( error, result ) {
		 	if( error ) {
				console.error( error );
			}
			
			console.log( 'Good: ', result.statusCode, result.text );
		} );

	supertest( 'http://localhost:' + config.port )
		.get( '/' )
		.set( config.headers.timestamp	, headers[config.headers.timestamp] - 11 )
		.set( config.headers.auth 		, headers[config.headers.auth] )
		.end( function( error, result ) {
		 	if( error ) {
				console.error( error );
			}
			
			console.log( 'Bad Timestamp:', result.statusCode, result.text );
		} );

	supertest( 'http://localhost:' + config.port )
		.get( '/' )
		.set( config.headers.timestamp	, headers[config.headers.timestamp] )
		.set( config.headers.auth 		, 'wrong'  )
		.end( function( error, result ) {
		 	if( error ) {
				console.error( error );
			}
			
			console.log( 'Bad Auth:', result.statusCode, result.text );
		} );

	supertest( 'http://localhost:' + config.port )
		.get( '/' )
		.end( function( error, result ) {
		 	if( error ) {
				console.error( error );
			}
			
			console.log( 'No Headers:', result.statusCode, result.text );
		} );

	setTimeout( function() {
		supertest( 'http://localhost:' + config.port )
			.get( '/' )
			.set( config.headers.timestamp	, headers[config.headers.timestamp] )
			.set( config.headers.auth 		, headers[config.headers.auth] )
			.end( function( error, result ) {
			 	if( error ) {
					console.error( error );
				}
				
				console.log( 'Replay Attack: ', result.statusCode, result.text );

				console.log( 'Shutting down' );
				process.exit(0);
			} );
	}, ( config.allowed_interval + 1 ) * 1000 );
} );


