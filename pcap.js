/*********************************************************************
  Purpose: File containing all of the code to parse a PCAP file
  and display it using D3 to create a ladder diagram.
  Author: Nick Knight
  Date: 23.05.2017
*********************************************************************/
$( document ).ready( function ()
{
  /*********************************************************************
    Function: drawGraph
    Purpose: Render the graph
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function drawGraph( etherframes, ipv4hosts )
  {
    var svgWidth = 800,
      svgHeight = 500,
      margin = {
        "top": 25,
        "right": 25,
        "bottom": 25,
        "left": 50
      },
      width = svgWidth - margin.left - margin.right,
      height = svgHeight - margin.top - margin.bottom;
    var svg = d3.select( ".viz" ).append( "svg" ).attr( "width", 800 ).attr( "height", 600 );
    var defs = svg.append( "defs" );
    defs.append( "marker" ).attr( "id", "arrow" ).attr( "viewBox", "0 0 10 10" ).attr( "refX", 10 ).attr( "refY", 5 ).attr( "markerWidth", 6 ).attr( "markerHeight", 6 ).attr( "orient", "auto" ).append( "path" ).attr( "d", "M 0 0 L 10 5 L 0 10 z" );
    var y = d3.scaleLinear().range( [ 0, height ] ).domain(
      [
        etherframes[ 0 ].ts_sec_offset,
        etherframes[ etherframes.length - 1 ].ts_sec_offset
      ] );
    // Inner Drawing Space
    var innerSpace = svg.append( "g" ).attr( "class", "inner_space" ).attr( "transform", "translate(" + margin.left + "," + margin.top + ")" );
    // Add the Y Axis
    var yAxis = d3.axisLeft( y );
    var y_axis = svg.append( "g" ).attr( "transform", "translate(" + margin.left + "," + margin.top + ")" ).call( yAxis );
    innerSpace.selectAll( ".host" ).data( ipv4hosts ).enter().append( "line" ).attr( "class", "host" ).attr( "x1", function ( d, i )
    {
      return ( i * 100 ) + margin.left
    } ).attr( "y1", function ( d, i )
    {
      return y( etherframes[ 0 ].ts_sec_offset )
    } ).attr( "x2", function ( d, i )
    {
      return ( i * 100 ) + margin.left
    } ).attr( "y2", function ( d, i )
    {
      return y( etherframes[ etherframes.length - 1 ].ts_sec_offset )
    } );
    innerSpace.selectAll( ".hosttext" ).data( ipv4hosts ).enter().append( 'text' ).attr( "class", "hosttext" ).attr( "x", function ( d, i )
    {
      return ( i * 100 ) + margin.left - 20
    } ).attr( "y", function ( d, i )
    {
      return y( etherframes[ 0 ].ts_sec_offset ) - 10
    } ).text( function ( d )
    {
      return d
    } );
    innerSpace.selectAll( ".dstporttext" ).data( etherframes ).enter().append( "text" ).attr( "class", "dstporttext" ).attr( "x", function ( d )
    {
      return ( d.ipv4.dsthostid * 100 ) + margin.left + 5
    } ).attr( "y", function ( d )
    {
      return y( d.ts_sec_offset )
    } ).text( function ( d )
    {
      if ( "ipv4" in d && "udp" in d.ipv4 && "dstport" in d.ipv4.udp )
      {
        return d.ipv4.udp.dstport;
      }
      if ( "ipv4" in d && "tcp" in d.ipv4 && "dstport" in d.ipv4.tcp )
      {
        return d.ipv4.tcp.dstport;
      }
      return "";
    } );
    innerSpace.selectAll( ".srcporttext" ).data( etherframes ).enter().append( "text" ).attr( "class", "srcporttext" ).attr( "x", function ( d )
    {
      return ( d.ipv4.srchostid * 100 ) + margin.left + 5
    } ).attr( "y", function ( d )
    {
      return y( d.ts_sec_offset )
    } ).text( function ( d )
    {
      if ( "ipv4" in d && "udp" in d.ipv4 && "srcport" in d.ipv4.udp )
      {
        return d.ipv4.udp.srcport;
      }
      if ( "ipv4" in d && "tcp" in d.ipv4 && "srcport" in d.ipv4.tcp )
      {
        return d.ipv4.tcp.srcport;
      }
      return "";
    } );
    innerSpace.selectAll( ".arrow" ).data( etherframes ).enter().append( "line" ).attr( "class", "arrow" ).attr( "marker-end", "url(#arrow)" ).attr( "x1", function ( d )
    {
      return ( d.ipv4.srchostid * 100 ) + margin.left
    } ).attr( "y1", function ( d )
    {
      return y( d.ts_sec_offset )
    } ).attr( "x2", function ( d )
    {
      return ( d.ipv4.dsthostid * 100 ) + margin.left
    } ).attr( "y2", function ( d )
    {
      return y( d.ts_sec_offset )
    } );
    svg.append( "rect" ).attr( "width", width ).attr( "height", height ).style( "fill", "none" ).style( "pointer-events", "all" ).call( d3.zoom().scaleExtent( [ 1 / 4, 10 ] ).on( "zoom", zoomed ) );

    function zoomed()
    {
      // re-scale y axis during zoom; ref [2]
      y_axis.transition().duration( 50 ).call( yAxis.scale( d3.event.transform.rescaleY( y ) ) );
      //innerSpace.attr("transform", d3.event.transform);
      var new_yScale = d3.event.transform.rescaleY( y );
      d3.select( "svg" ).selectAll( ".arrow" ).attr( "x1", function ( d )
      {
        return ( d.ipv4.srchostid * 100 ) + margin.left
      } ).attr( "y1", function ( d )
      {
        return new_yScale( d.ts_sec_offset )
      } ).attr( "x2", function ( d )
      {
        return ( d.ipv4.dsthostid * 100 ) + margin.left
      } ).attr( "y2", function ( d )
      {
        return new_yScale( d.ts_sec_offset )
      } );
      d3.select( "svg" ).selectAll( ".srcporttext" ).attr( "x", function ( d )
      {
        return ( d.ipv4.srchostid * 100 ) + margin.left + 5
      } ).attr( "y", function ( d )
      {
        return new_yScale( d.ts_sec_offset )
      } )
      d3.select( "svg" ).selectAll( ".dstporttext" ).attr( "x", function ( d )
      {
        return ( d.ipv4.dsthostid * 100 ) + margin.left + 5
      } ).attr( "y", function ( d )
      {
        return new_yScale( d.ts_sec_offset )
      } )
    }
    return;
  }

  /*********************************************************************
    Purpose: The next section is here to parse the contents of a PCAP
    file. This first method needs improving. As when reading a large file
    , for the purpose of a ladder diagram, we don't need to look at all
    the parts of each packet. The format of PCAP can be Found
    https://wiki.wireshark.org/Development/LibpcapFileFormat
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function abortRead()
  {
    reader.abort();
  }

  function errorHandler( evt )
  {
    switch ( evt.target.error.code )
    {
    case evt.target.error.NOT_FOUND_ERR:
      alert( 'File Not Found!' );
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert( 'File is not readable' );
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert( 'An error occurred reading this file.' );
    };
  }

  /*********************************************************************
    Function: updateProgress
    Purpose: TODO: tie this function to something actually on the page
    to indicate we are loading the PCAP file.
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function updateProgress( evt )
  {
    // evt is an ProgressEvent.
    if ( evt.lengthComputable )
    {
      var percentLoaded = Math.round( ( evt.loaded / evt.total ) * 100 );
      // Increase the progress bar length.
      if ( percentLoaded < 100 )
      {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
      }
    }
  }

  /*********************************************************************
    Function: toHex
    Purpose: Little helper function to convert value into a hex value.
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function toHex( d )
  {
    return ( "0" + ( Number( d ).toString( 16 ) ) ).slice( -2 ).toUpperCase()
  }

  if ( window.File && window.FileReader && window.FileList && window.Blob )
  {
    // Great success! All the File APIs are supported.

    /*********************************************************************
      Function: handleFileSelect
      Purpose: This is the workhorse. User has selected a file and we can
      now parse it.
      Author: Nick Knight
      Date: 23.05.2017
    *********************************************************************/
    function handleFileSelect( evt )
    {
      var files = evt.target.files; // FileList object
      var file;
      var state = 0;
      var fileposition = 0;
      var reader = new FileReader();
      reader.onerror = errorHandler;
      reader.onprogress = updateProgress;
      reader.onabort = function ( e )
      {
        alert( 'File read cancelled' );
      };
      reader.onloadstart = function ( e )
      {
        //document.getElementById('progress_bar').className = 'loading';
      };
      var ts_sec = 0;
      var ts_usec = 0;
      var ts_firstether = -1;
      var frame = 0;
      var ipv4hosts = [];
      var etherframes = [];
      reader.onload = function ( e )
      {
        var data = e.currentTarget.result;
        switch ( state )
        {
        case 0:
          var uint32array = new Uint32Array( data );
          var int32array = new Int32Array( data );
          // Do we need version info for now?
          //var uint16array = new Uint16Array(data);
          /* Magic number */
          if ( 2712847316 == uint32array[ 0 ] )
          {
            /* Native byte order */
            console.log( "Native byte order" );
          }
          else if ( 3569595041 == uint32array[ 0 ] )
          {
            /* Swapped byte order */
            console.log( "Swapped byte order" );
          }
          else if ( 2712812621 == uint32array[ 0 ] )
          {
            /* Native byte order nano second timing */
            console.log( "Native byte order nano second timing" );
          }
          else if ( 1295823521 == uint32array[ 0 ] )
          {
            /* Swapped byte order nano second timing */
            console.log( "Swapped byte order nano second timing" );
          }
          /* http://www.tcpdump.org/linktypes.html */
          if ( 1 != uint32array[ 5 ] )
          {
            console.log( "Link layer type not supported" );
            return;
          }
          console.log( "LINKTYPE_ETHERNET" );
          /* Read our first packet header */
          var blob = file.slice( fileposition, fileposition + 16 );
          fileposition += 16;
          reader.readAsArrayBuffer( blob );
          state = 1;
          break;
        case 1:
          var uint32array = new Uint32Array( data );
          ts_sec = uint32array[ 0 ];
          ts_usec = uint32array[ 1 ];
          var incl_len = uint32array[ 2 ];
          var orig_len = uint32array[ 3 ];
          if ( 0 == incl_len )
          {
            var blob = file.slice( fileposition, fileposition + 16 );
            fileposition += 16;
            reader.readAsArrayBuffer( blob );
            break;
          }
          var blob = file.slice( fileposition, fileposition + incl_len );
          fileposition += incl_len;
          reader.readAsArrayBuffer( blob );
          state = 2;
          break;
        case 2:
          var uint8array = new Uint8Array( data );
          var etherpacket = {};
          etherpacket.frame = frame;
          frame++;
          etherpacket.ts_sec = ts_sec + ( ts_usec / 1000000 );
          if ( -1 == ts_firstether )
          {
            ts_firstether = etherpacket.ts_sec;
          }
          etherpacket.ts_sec_offset = ( ts_sec + ( ts_usec / 1000000 ) ) - ts_firstether;
          //etherpacket.ts_usec = ts_usec;
          etherpacket.src = "" + toHex( uint8array[ 0 ] ) + ":" + toHex( uint8array[ 1 ] ) + ":" + toHex( uint8array[ 2 ] ) + ":" + toHex( uint8array[ 3 ] ) + ":" + toHex( uint8array[ 4 ] ) + ":" + toHex( uint8array[ 5 ] );
          etherpacket.dst = "" + toHex( uint8array[ 6 ] ) + ":" + toHex( uint8array[ 7 ] ) + ":" + toHex( uint8array[ 8 ] ) + ":" + toHex( uint8array[ 9 ] ) + ":" + toHex( uint8array[ 10 ] ) + ":" + toHex( uint8array[ 11 ] );
          etherpacket.ethertype = "" + toHex( uint8array[ 12 ] ) + toHex( uint8array[ 13 ] );
          if ( parseInt( etherpacket.ethertype, 16 ) > 1536 )
          {
            // Ref: https://en.wikipedia.org/wiki/EtherType
            switch ( etherpacket.ethertype )
            {
            case "0800":
              /* IPV4 */
              etherpacket.ipv4 = {};
              etherpacket.ipv4.data = uint8array.slice( 14, uint8array.length );
              etherpacket.ipv4.version = parseInt( toHex( ( etherpacket.ipv4.data[ 0 ] >> 4 ) & 0xf ), 16 );
              etherpacket.ipv4.ihl = parseInt( toHex( etherpacket.ipv4.data[ 0 ] & 0xf ), 16 );
              etherpacket.ipv4.dscp = toHex( ( etherpacket.ipv4.data[ 1 ] >> 2 ) & 0x3f );
              etherpacket.ipv4.ecn = toHex( etherpacket.ipv4.data[ 1 ] & 0x3 );
              etherpacket.ipv4.totallength = parseInt( toHex( etherpacket.ipv4.data[ 2 ] ) + toHex( etherpacket.ipv4.data[ 3 ] ), 16 );
              etherpacket.ipv4.identification = parseInt( toHex( etherpacket.ipv4.data[ 4 ] ) + toHex( etherpacket.ipv4.data[ 5 ] ), 16 );
              etherpacket.ipv4.flags = toHex( ( etherpacket.ipv4.data[ 6 ] >> 5 ) & 7 );
              etherpacket.ipv4.fragmentoffset = "" + toHex( etherpacket.ipv4.data[ 6 ] & 0x1f ) + toHex( etherpacket.ipv4.data[ 7 ] );
              etherpacket.ipv4.ttl = etherpacket.ipv4.data[ 8 ];
              etherpacket.ipv4.protocol = etherpacket.ipv4.data[ 9 ];
              etherpacket.ipv4.checksum = "" + toHex( etherpacket.ipv4.data[ 10 ] ) + toHex( etherpacket.ipv4.data[ 11 ] );
              etherpacket.ipv4.src = "" + etherpacket.ipv4.data[ 12 ] + "." + etherpacket.ipv4.data[ 13 ] + "." + etherpacket.ipv4.data[ 14 ] + "." + etherpacket.ipv4.data[ 15 ];
              etherpacket.ipv4.dst = "" + etherpacket.ipv4.data[ 16 ] + "." + etherpacket.ipv4.data[ 17 ] + "." + etherpacket.ipv4.data[ 18 ] + "." + etherpacket.ipv4.data[ 19 ];
              var hostid = -1;
              if ( -1 == ( hostid = ipv4hosts.indexOf( etherpacket.ipv4.src ) ) )
              {
                etherpacket.ipv4.srchostid = ipv4hosts.length;
                ipv4hosts.push( etherpacket.ipv4.src );
              }
              else
              {
                etherpacket.ipv4.srchostid = hostid;
              }
              if ( -1 == ( hostid = ipv4hosts.indexOf( etherpacket.ipv4.dst ) ) )
              {
                etherpacket.ipv4.dsthostid = ipv4hosts.length;
                ipv4hosts.push( etherpacket.ipv4.dst );
              }
              else
              {
                etherpacket.ipv4.dsthostid = hostid;
              }
              switch ( etherpacket.ipv4.protocol )
              {
              case 17:
                /* UDP */
                etherpacket.ipv4.udp = {};
                etherpacket.ipv4.udp.srcport = parseInt( toHex( etherpacket.ipv4.data[ 20 ] ) + toHex( etherpacket.ipv4.data[ 21 ] ), 16 );
                etherpacket.ipv4.udp.dstport = parseInt( toHex( etherpacket.ipv4.data[ 22 ] ) + toHex( etherpacket.ipv4.data[ 23 ] ), 16 );
                etherpacket.ipv4.udp.length = parseInt( toHex( etherpacket.ipv4.data[ 24 ] ) + toHex( etherpacket.ipv4.data[ 25 ] ), 16 );
                etherpacket.ipv4.udp.checksum = parseInt( toHex( etherpacket.ipv4.data[ 26 ] ) + toHex( etherpacket.ipv4.data[ 27 ] ), 16 );
                etherpacket.ipv4.udp.data = etherpacket.ipv4.data.slice( 28, etherpacket.ipv4.data.length );
                break;
              case 6:
                /* TCP */
                etherpacket.ipv4.tcp = {};
                etherpacket.ipv4.tcp.srcport = parseInt( toHex( etherpacket.ipv4.data[ 20 ] ) + toHex( etherpacket.ipv4.data[ 21 ] ), 16 );
                etherpacket.ipv4.tcp.dstport = parseInt( toHex( etherpacket.ipv4.data[ 22 ] ) + toHex( etherpacket.ipv4.data[ 23 ] ), 16 );
                etherpacket.ipv4.tcp.sequencenumber = parseInt( toHex( etherpacket.ipv4.data[ 24 ] ) + toHex( etherpacket.ipv4.data[ 25 ] ) + toHex( etherpacket.ipv4.data[ 26 ] ) + toHex( etherpacket.ipv4.data[ 27 ] ), 16 );
                etherpacket.ipv4.tcp.acknowledgmentnumber = parseInt( toHex( etherpacket.ipv4.data[ 28 ] ) + toHex( etherpacket.ipv4.data[ 29 ] ) + toHex( etherpacket.ipv4.data[ 30 ] ) + toHex( etherpacket.ipv4.data[ 31 ] ), 16 );
                etherpacket.ipv4.tcp.dataoffset = ( etherpacket.ipv4.data[ 32 ] >> 4 ) & 0xf;
                etherpacket.ipv4.tcp.flags = {};
                etherpacket.ipv4.tcp.flags.ns = etherpacket.ipv4.data[ 32 ] & 1;
                etherpacket.ipv4.tcp.flags.cwr = ( etherpacket.ipv4.data[ 33 ] >> 7 ) & 1;
                etherpacket.ipv4.tcp.flags.ece = ( etherpacket.ipv4.data[ 33 ] >> 6 ) & 1;
                etherpacket.ipv4.tcp.flags.urg = ( etherpacket.ipv4.data[ 33 ] >> 5 ) & 1;
                etherpacket.ipv4.tcp.flags.ack = ( etherpacket.ipv4.data[ 33 ] >> 4 ) & 1;
                etherpacket.ipv4.tcp.flags.psh = ( etherpacket.ipv4.data[ 33 ] >> 3 ) & 1;
                etherpacket.ipv4.tcp.flags.rst = ( etherpacket.ipv4.data[ 33 ] >> 2 ) & 1;
                etherpacket.ipv4.tcp.flags.syn = ( etherpacket.ipv4.data[ 33 ] >> 1 ) & 1;
                etherpacket.ipv4.tcp.flags.fin = etherpacket.ipv4.data[ 33 ] & 1;
                etherpacket.ipv4.tcp.windowsize = parseInt( toHex( etherpacket.ipv4.data[ 34 ] ) + toHex( etherpacket.ipv4.data[ 35 ] ), 16 );
                etherpacket.ipv4.tcp.checksum = parseInt( toHex( etherpacket.ipv4.data[ 36 ] ) + toHex( etherpacket.ipv4.data[ 37 ] ), 16 );
                etherpacket.ipv4.tcp.urgentpointer = parseInt( toHex( etherpacket.ipv4.data[ 38 ] ) + toHex( etherpacket.ipv4.data[ 39 ] ), 16 );
                etherpacket.ipv4.tcp.data = etherpacket.ipv4.data.slice( 20 + ( etherpacket.ipv4.tcp.dataoffset * 4 ), etherpacket.ipv4.data.length );
                break;
              }
              break;
            case "86DD":
              /* IPV6 */
              break;
            case "0806":
              /* ARP */
              break;
            case "9100":
              /* VLAN tagged */
              break;
            }
          }
          else
          {
            // We probbaly won't need this as is raw length.
          }
          etherframes.push( etherpacket );
          if ( etherframes.length > 100 )
          {
            drawGraph( etherframes, ipv4hosts );
            return;
          }
          var blob = file.slice( fileposition, fileposition + 16 );
          fileposition += 16;
          if ( fileposition > file.size )
          {
            drawGraph( etherframes, ipv4hosts );
            return;
          }
          reader.readAsArrayBuffer( blob );
          state = 1;
          break;
        }
      }
      file = files[ 0 ];
      var blob = file.slice( fileposition, fileposition + 24 );
      fileposition += 24;
      reader.readAsArrayBuffer( blob );
    }
    document.getElementById( 'files' ).addEventListener( 'change', handleFileSelect, false );
  }
  else
  {
    alert( 'The File APIs are not fully supported in this browser.' );
  }
} );
