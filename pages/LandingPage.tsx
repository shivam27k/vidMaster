'use client'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RTCConfiguration } from '@/app/types'
import { RtmClient, RtmMessage, RtmTextMessage } from 'agora-rtm-sdk/index'
import Loading from '@/components/loading'
import VideoComponent from '@/components/videoComponent'

const LandingPage = () => {
	let localStream: MediaStream | undefined
	let remoteStream: MediaStream | undefined
	let peerConnection: RTCPeerConnection | undefined
	let client: RtmClient
	let channel: any
	const searchParams: any = useSearchParams()

	const [swapVideos, setSwapVideos] = useState(true)

	const [UID, setUID] = useState(String(Math.floor(Math.random() * 1010000)))

	let queryString: string = searchParams
	let urlParams: URLSearchParams = new URLSearchParams(queryString)
	let roomId: any = urlParams.get('room')

	useEffect(() => {
		if (!roomId) {
			window.location.href = '/lobby'
		}
	}, [roomId])

	let APP_ID: string = 'a5953c3ce0794d0ab9bab769c761e8e8'

	useEffect(() => {
		setUID(String(Math.floor(Math.random() * 1010000)))
	}, [])

	const servers: RTCConfiguration = {
		iceServers: [
			{
				urls: [
					'stun:stun1.l.google.com:19302',
					'stun:stun2.l.google.com:19302',
				],
			},
		],
	}

	const handleMessageFromPeer = async (
		message: RtmMessage,
		memberId: string
	) => {
		if (message.text) {
			const parsedMessage = JSON.parse(message.text)
			if (parsedMessage?.type === 'offer') {
				createAnswer(parsedMessage?.offer, memberId)
			}
			if (parsedMessage?.type === 'answer') {
				addAnswer(parsedMessage?.answer)
			}
			if (parsedMessage?.type === 'candidate') {
				if (parsedMessage?.candidate) {
					peerConnection?.addIceCandidate(parsedMessage?.candidate)
				}
			}
		}
	}

	const tryLogin = async () => {
		const { default: AgoraRTM } = await import('agora-rtm-sdk')
		client = AgoraRTM.createInstance(APP_ID)

		client.on('MessageFromPeer', handleMessageFromPeer)

		try {
			await client.login({ uid: UID })
		} catch (error) {
			setTimeout(tryLogin, 10000)
		}
	}

	const handleUserJoined = async (memberId: any) => {
		createOffer(memberId)
	}

	let createPeerConnection = async (memberId: any) => {
		peerConnection = new RTCPeerConnection(servers)
		remoteStream = new MediaStream()

		const user2Video = document.getElementById(
			'user-2'
		) as HTMLVideoElement | null
		if (user2Video) {
			user2Video.srcObject = remoteStream
			user2Video.style.display = 'block'
		}

		if (!localStream) {
			localStream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: true,
			})
			const user1Video = document.getElementById(
				'user-1'
			) as HTMLVideoElement | null
			if (user1Video) {
				user1Video.srcObject = localStream
			}
		}

		localStream?.getTracks().forEach((track) => {
			peerConnection?.addTrack(track, localStream!)
		})

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream?.addTrack(track)
			})
		}

		peerConnection.onicecandidate = (event) => {
			try {
				if (peerConnection && peerConnection.remoteDescription) {
					client.sendMessageToPeer(
						{
							text: JSON.stringify({
								type: 'candidate',
								candidate: event?.candidate,
							}),
						},
						memberId
					)
				} else {
					console.warn(
						'Remote description is not set. Ice candidate not added.'
					)
				}
			} catch (err) {
				console.error('Error sending ICE candidate', err)
			}
		}
	}

	let createOffer = async (memberId: any) => {
		await createPeerConnection(memberId)

		let offer = await peerConnection?.createOffer()
		await peerConnection?.setLocalDescription(offer)
		try {
			client.sendMessageToPeer(
				{
					text: JSON.stringify({
						type: 'offer',
						offer: offer,
					}),
				},
				memberId
			)
		} catch (err) {
			console.error('Error sending offer', err)
		}
	}

	let createAnswer = async (
		offer: RTCSessionDescriptionInit,
		memberId: any
	) => {
		await createPeerConnection(memberId)

		await peerConnection?.setRemoteDescription(offer)
		let answer = await peerConnection?.createAnswer()
		await peerConnection?.setLocalDescription(answer)

		try {
			client.sendMessageToPeer(
				{
					text: JSON.stringify({
						type: 'answer',
						answer: answer,
					}),
				},
				memberId
			)
		} catch (err) {
			console.error('Error sending answer', err)
		}
	}

	let addAnswer = async (answer: any) => {
		if (!peerConnection?.currentRemoteDescription) {
			await peerConnection?.setRemoteDescription(answer)
		}
	}

	const handleUserLeft = async (memberId: any) => {
		const user2Video = document.getElementById(
			'user-2'
		) as HTMLVideoElement | null
		if (user2Video) {
			user2Video.style.display = 'none'
		}
	}

	let init = async () => {
		try {
			await tryLogin()

			channel = client.createChannel(roomId)
			await channel.join()

			channel.on('MemberJoined', handleUserJoined)

			channel.on('MemberLeft', handleUserLeft)

			localStream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: true,
			})

			const user1Video = document.getElementById(
				'user-1'
			) as HTMLVideoElement | null
			if (user1Video) {
				user1Video.srcObject = localStream
			}
		} catch (error) {
			console.error('Error during initalization', error)
		}
	}

	useEffect(() => {
		init()
	})

	const leaveChannel = async () => {
		await channel.leave()
		await client.logout()
	}

	useEffect(() => {
		window.addEventListener('beforeunload', leaveChannel)

		return () => {
			window.removeEventListener('beforeunload', leaveChannel)
		}
	})

	return (
		<>
			{roomId ? (
				<div className="bg-white overflow-hidden">
					<div className={`flex flex-row gap-5 p-10`}>
						<VideoComponent
							flex={swapVideos ? null : 1}
							width={swapVideos ? '5rem' : '60vw'}
							height={swapVideos ? '5rem' : '70vh'}
							id={'user-1'}
							onClick={() => {
								console.log('void vid 1')
								setSwapVideos(!swapVideos)
							}}
							userText={'User-1'}
						/>

						<VideoComponent
							flex={swapVideos ? 1 : null}
							width={swapVideos ? '60vw' : '5rem'}
							height={swapVideos ? '70vh' : '5rem'}
							id={'user-2'}
							onClick={() => {
								console.log('void vid 2')
								setSwapVideos(!swapVideos)
							}}
							// style={{ display: 'none' }}
							userText={'User-2'}
						/>
					</div>
				</div>
			) : (
				<>
					<Loading />
				</>
			)}
		</>
	)
}

export default LandingPage
