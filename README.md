# bachelors-thesis

Master Music

The application’s main purpose is to support users in learning music. The user will supply a musicXML file which will be parsed and displayed as sheet music. The user will also be given the option to hear the music. But the primary goal of the application is to “listen” to the user sing the melody and give instant feedback about the pitch and the duration. 

The application provides the following features:

- Read music notation files.
- Offer sample files.
- Display the sheet music created from the data read from the file.
- Play the melody created from the data read from the file.
- Get audio input from the microphone.
- Filter out periods of silence from the input stream.
- Detect the pitch of the input audio data - the note that is being sung.
- Provide feedback in real time regarding the correspondence between the detected pitch, and the current note from the sheet music.
- Track the current position in the song.
- Compare the duration of the notes that are being sung to the data from the sheet music and determine correctness.
- Offer the possibility to set different tempos.
- Present an intuitive and user-friendly GUI.

Specification

- Music notation data: Uncompressed MusicXML files are be used. The user must supply the file.
- The pitch and duration tags store the data that is of interest. The rest of the tags are used to display the sheet music and play the audio.
- The sample files is provided by a server.
- The audio input is captured using Web Audio API’s MediaStreamSource node.
- The windowing function and the Fast Fourier Transform are applied through the Web Audio API’s analyser node methods.
- The note having the pitch of the audio input is computed using as reference the frequencies for equal-tempered scale. 
- The silence detection is achieved using normalized energy.
