# playground-aoc-spec-server

Example UserPatch spectator server relay

I wanted to figure out how easy/hard it is to implement a spectator relay. It turns out it's very easy! The UP spec server streams out a short header and then the recorded game file as it is played.

This could quite easily be adapted into a relay that supports many spectators (more than UP's max of 32), spec delays, a live recorded game analysis, etc.

This example supports joining at any point after the game has started, regardless of the late join configuration in UP itself.

[More](#more) - [Usage](#usage) - [License: Apache-2.0](#license)

## More

Since it was easier than expected, I might try adding more stuff to this proof-of-concept:

 - spec delay
 - live data stream using recage, to test its streams impl
 - ???

## Usage

First start a UserPatch game that allows spectators (Sx button in the game setup room)

then do:
```bash
# provide the host IP that's runnning a spectatable game
node index 192.168.178.116
```

Then you can spec using
```bash
# provide IP of the box running the spec relay server
wine Age2_x1/spectate.exe 192.168.178.112
```

## License

[Apache-2.0](LICENSE.md)
