/**
 * External dependencies
 */
require( 'es6-promise' ).polyfill();
import 'whatwg-fetch';
import assign from 'lodash/assign';

/**
 * External dependencies
 */

function JetpackRestApiClient( root, nonce ) {
	let apiRoot = root,
		headers = {
			'X-WP-Nonce': nonce
		},
		getParams = {
			credentials: 'same-origin',
			headers: headers
		},
		postParams = {
			method: 'post',
			credentials: 'same-origin',
			headers: assign( {}, headers, {
				'Content-type': 'application/json'
			} )
		};

	const methods = {
		setApiRoot( newRoot ) {
			apiRoot = newRoot;
		},
		setApiNonce( newNonce ) {
			headers = {
				'X-WP-Nonce': newNonce
			};
			getParams = {
				credentials: 'same-origin',
				headers: headers
			};
			postParams = {
				method: 'post',
				credentials: 'same-origin',
				headers: assign( {}, headers, {
					'Content-type': 'application/json'
				} )
			};
		},

		fetchSiteConnectionStatus: () => getRequest( `${ apiRoot }jetpack/v4/connection`, getParams )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchUserConnectionData: () => getRequest( `${ apiRoot }jetpack/v4/connection/data`, getParams )
			.then( response => response.json().catch( catchJsonParseError ) ),

		disconnectSite: () => postRequest( `${ apiRoot }jetpack/v4/connection`, postParams, {
			body: JSON.stringify( { isActive: false } )
		} )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchConnectUrl: () => getRequest( `${ apiRoot }jetpack/v4/connection/url`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		unlinkUser: () => postRequest( `${ apiRoot }jetpack/v4/connection/user`, postParams, {
			body: JSON.stringify( { linked: false } )
		} )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		jumpStart: ( action ) => {
			let active;
			if ( action === 'activate' ) {
				active = true;
			}
			if ( action === 'deactivate' ) {
				active = false;
			}
			return postRequest( `${ apiRoot }jetpack/v4/jumpstart`, postParams, {
				body: JSON.stringify( { active } )
			} )
				.then( checkStatus )
				.then( response => response.json().catch( catchJsonParseError ) );
		},

		fetchModules: () => getRequest( `${ apiRoot }jetpack/v4/module/all`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchModule: ( slug ) => getRequest( `${ apiRoot }jetpack/v4/module/${ slug }`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		activateModule: ( slug ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }/active`,
			postParams,
			{
				body: JSON.stringify( { active: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		deactivateModule: ( slug ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }/active`,
			postParams,
			{
				body: JSON.stringify( { active: false } )
			}
		),

		updateModuleOptions: ( slug, newOptionValues ) => postRequest(
			`${ apiRoot }jetpack/v4/module/${ slug }`,
			postParams,
			{
				body: JSON.stringify( newOptionValues )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		updateSettings: ( newOptionValues ) => postRequest(
			`${ apiRoot }jetpack/v4/settings`,
			postParams,
			{
				body: JSON.stringify( newOptionValues )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		getProtectCount: () => getRequest( `${ apiRoot }jetpack/v4/module/protect/data`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		resetOptions: ( options ) => postRequest(
			`${ apiRoot }jetpack/v4/options/${ options }`,
			postParams,
			{
				body: JSON.stringify( { reset: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		getVaultPressData: () => getRequest( `${ apiRoot }jetpack/v4/module/vaultpress/data`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		getAkismetData: () => getRequest( `${ apiRoot }jetpack/v4/module/akismet/data`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		checkAkismetKey: () => getRequest( `${ apiRoot }jetpack/v4/module/akismet/key/check`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		checkAkismetKeyTyped: apiKey => postRequest(
			`${ apiRoot }jetpack/v4/module/akismet/key/check`,
			postParams,
			{
				body: JSON.stringify( { api_key: apiKey } )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchStatsData: ( range ) => getRequest( statsDataUrl( range ), getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		getPluginUpdates: () => getRequest( `${ apiRoot }jetpack/v4/updates/plugins`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchSettings: () => getRequest( `${ apiRoot }jetpack/v4/settings`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		updateSetting: ( updatedSetting ) => postRequest( `${ apiRoot }jetpack/v4/settings`, postParams, {
			body: JSON.stringify( updatedSetting )
		} )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchSiteData: () => getRequest( `${ apiRoot }jetpack/v4/site`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) )
			.then( body => JSON.parse( body.data ) ),

		fetchSiteFeatures: () => getRequest( `${ apiRoot }jetpack/v4/site/features`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) )
			.then( body => JSON.parse( body.data ) ),

		dismissJetpackNotice: ( notice ) => postRequest(
			`${ apiRoot }jetpack/v4/notice/${ notice }`,
			postParams,
			{
				body: JSON.stringify( { dismissed: true } )
			}
		)
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) ),

		fetchPluginsData: () => getRequest( `${ apiRoot }jetpack/v4/plugins`, getParams )
			.then( checkStatus )
			.then( response => response.json().catch( catchJsonParseError ) )
	};

	function addCacheBuster( route ) {
		const parts = route.split( '?' ),
			query = parts.length > 1
				? parts[ 1 ]
				: '',
			args = query.length
				? query.split( '&' )
				: [];

		args.push( '_cacheBuster=' + new Date().getTime() );

		return parts[ 0 ] + '?' + args.join( '&' );
	}

	function getRequest( route, params ) {
		return fetch( addCacheBuster( route ), params );
	}

	function postRequest( route, params, body ) {
		return fetch( route, assign( {}, params, body ) );
	}

	function statsDataUrl( range ) {
		let url = `${ apiRoot }jetpack/v4/module/stats/data`;
		if ( url.indexOf( '?' ) !== -1 ) {
			url = url + `&range=${ encodeURIComponent( range ) }`;
		} else {
			url = url + `?range=${ encodeURIComponent( range ) }`;
		}
		return url;
	}

	assign( this, methods );
}

const restApi = new JetpackRestApiClient();

export default restApi;

function checkStatus( response ) {
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}
	return response.json().then( json => {
		const error = new Error( json.message );
		error.response = json;
		throw error;
	} ).catch( catchJsonParseError );
}

function catchJsonParseError( e ) {
	throw new Error( `Couldn't understand Jetpack's REST API response (${ e.name })` );
}
