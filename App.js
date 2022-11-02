import { Camera, CameraType, FlashMode } from 'expo-camera'
import { useState } from 'react'
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as FaceDetector from 'expo-face-detector'
import * as FileSystem from 'expo-file-system'

export default function App() {
	const [type, setType] = useState(CameraType.front)
	const [flash, setFlash] = useState(FlashMode.off)

	const [cameraRef, setCameraRef] = useState(null)
	const [box, setBox] = useState(null)

	const [permission, requestPermission] = Camera.useCameraPermissions()

	const toggleCameraType = () => {
		setType(current => (current === CameraType.back ? CameraType.front : CameraType.back))
	}

	const toggleFlash = () => {
		setFlash(current => (current === FlashMode.off ? FlashMode.on : FlashMode.off))
	}

	const handleFacesDetected = ({ faces }) => {
		if (faces[0]) {
			setBox({
				width: faces[0].bounds.size.width,
				height: faces[0].bounds.size.height,
				x: faces[0].bounds.origin.x,
				y: faces[0].bounds.origin.y
			})
		} else {
			setBox(null)
		}
	}

	const handlePictureClick = async () => {
		let photo = await cameraRef.takePictureAsync()
		console.log('photo', photo)

		console.log(photo.uri.split('Camera')[1])
		FileSystem.copyAsync({
			from: photo.uri,
			to: FileSystem.documentDirectory + photo.uri.split('Camera')[1]
		})
	}

	if (!permission) return <View />

	if (!permission.granted)
		return (
			<View style={styles.container}>
				<Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		)

	return (
		<View style={styles.container}>
			<Camera
				ref={ref => {
					setCameraRef(ref)
				}}
				takePictureAsync={handlePictureClick}
				onFacesDetected={handleFacesDetected}
				faceDetectorSettings={{
					mode: FaceDetector.FaceDetectorMode.fast,
					detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
					runClassifications: FaceDetector.FaceDetectorClassifications.none,
					minDetectionInterval: 100,
					tracking: true
				}}
				style={styles.camera}
				flashMode={flash}
				type={type}
			>
				{box ? (
					<View
						style={styles.bound({
							width: box.width,
							height: box.height,
							x: box.x,
							y: box.y
						})}
					/>
				) : (
					<View />
				)}

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={toggleCameraType}>
						<Ionicons
							name={type === CameraType.front ? 'camera-reverse-outline' : 'camera-reverse'}
							size={30}
							color="white"
						/>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={handlePictureClick}>
						<Ionicons name={'aperture'} size={40} color="white" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={toggleFlash}>
						<Ionicons name={flash === FlashMode.on ? 'md-flash' : 'md-flash-outline'} size={30} color="white" />
					</TouchableOpacity>
				</View>
			</Camera>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center'
	},
	camera: {
		flex: 1,
		zIndex: 1
	},
	buttonContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'transparent',
		margin: 64
	},
	button: {
		flex: 1,
		alignSelf: 'flex-end',
		alignItems: 'center'
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white'
	},
	bound: ({ width, height, x, y }) => {
		return {
			position: 'absolute',
			top: y,
			left: x,
			height,
			width,
			borderWidth: 2,
			borderColor: 'white',
			zIndex: 1000
		}
	}
})
