import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { File, Paths } from "expo-file-system";
import { useRef, useState } from "react";
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const cameraRef = useRef<CameraView>(null);

  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync();

    if (!photo?.uri) return;

    const destination = new File(Paths.document, `photo-${Date.now()}.jpg`);
    new File(photo.uri).copy(destination);
    setCapturedUri(destination.uri);
    console.log("Saved to:", destination.uri);
  }
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === "back" ? "front" : "back"));
  }

  if (capturedUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={() => setIsReady(true)}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={!isReady}>
          <Text style={styles.text}>Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
