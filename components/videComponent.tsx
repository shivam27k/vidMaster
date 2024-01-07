import React, { FunctionComponent } from 'react'

type Props = {
	onClick: any
	width: any
	flex: any
	height: any
	id: any
	style: any
	userText: any
}

const VideComponent: FunctionComponent<Props> = ({
	onClick,
	width,
	flex,
	height,
	id,
	style,
	userText,
}) => {
	return (
		<div>
			<button onClick={onClick}>
				<video
					className={`bg-[#000]  flex-${flex}  w-[${width}] h-[${height}]`}
					id={id}
					style={style}
					autoPlay
					playsInline
				/>
				<p>{userText}</p>
			</button>
		</div>
	)
}

export default VideComponent
