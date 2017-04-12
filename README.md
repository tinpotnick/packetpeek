# packetpeek
Web application which can read pcap files and do something useful with them.

The complete implementation is in Javascript and HTML 5.

At the moment, this is a very basic intro. It doesn't really work with large files
yet as dynamic loading as you scroll through data needs supporting. But it can read
pcap files, parse for ethernet up through IPV4/TCP/UDP packets.

Also, support for looking for traffic of different types.

My goal is to use this as a tool to analyse capture files for applications such as VOIP.

Currently it has a basic function to dray a traffic ladder diagram using D3 JS.
