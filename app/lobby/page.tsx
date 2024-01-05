'use client'
import React, { useState } from 'react'

const LobbyRoom = () => {
	const handleNavigation = (roomIdEntered: any) => {
		window.location.href = `/?room=${roomIdEntered.replace(/\s/g, '')}`
	}

	const handleSubmit = (e: any) => {
		e.preventDefault()
		handleNavigation(e.target.room_id.value)
	}

	return (
		<div className="flex items-center justify-center">
			<form
				className="flex flex-col w-fit justify-center items-center"
				onSubmit={handleSubmit}
			>
				<label className="form-control w-fit">
					<div className="label">
						<span className="label-text">Enter a room code</span>
					</div>
					<input
						type="text"
						placeholder="Type here"
						name="room_id"
						className="input input-bordered w-full max-w-xs"
					/>
				</label>
				<input
					type="submit"
					value="Submit"
					className="btn btn-wide m-[2rem]"
				/>
			</form>
		</div>
	)
}

export default LobbyRoom
