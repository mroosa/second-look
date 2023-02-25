import { useCallback, useEffect, useRef, useState } from "react"
import LeftArrow from "../../assets/icons/LeftArrow"
import RightArrow from "../../assets/icons/RightArrow"
import { Shot } from "../../types"
import { useOutsideAlerter } from "../../utils/hooks"
import { SettingState } from "../../utils/reducer"
import "./style.scss"

interface OpenedShotProps {
    images: Shot[],
    shot: Shot,
    closeShot: Function,
    state: SettingState,
}

export const OpenedShot = ({ images, shot, closeShot, state }: OpenedShotProps) => {
    const [currentShot, setCurrentShot] = useState(shot)
    const imgRef = useRef(null)
    const arrowLeft = useRef(null)
    const arrowRight = useRef(null)
    useOutsideAlerter([imgRef, arrowLeft, arrowRight], closeShot);
    const currentShotIndex = images.findIndex((item: Shot) => item.createdAt == currentShot.createdAt)

    const handleClick = (clickType: 0 | 1, e?: any) => {
        if (e) e.preventDefault()
        if (state.openLinkClick == clickType)
            document.location.href = `${state.linkApp ? 'discord://' : ''}${currentShot.messageUrl}`
        else
            closeShot()
    }

    const prevShot = () => setCurrentShot(images[currentShotIndex - 1])

    const nextShot = () => setCurrentShot(images[currentShotIndex + 1])

    const handleKeyboard = (event: any) => {
          const { key } = event;
          switch (key) {
            case 'ArrowLeft':
                if (currentShotIndex - 1 < 0) return
                return prevShot();
            case 'ArrowRight':
                if (currentShotIndex + 1 > images.length - 1) return
                return nextShot();
            case 'Escape':
              return closeShot();
            default:
              return false;
          }
        }

      useEffect(() => {
        window.addEventListener('keyup', handleKeyboard);
        return () => window.removeEventListener('keyup', handleKeyboard);
      }, [handleKeyboard]);

    return (
        <div className="OpenedShot">
            <div className="opened-image-wrapper" onContextMenu={(e) => handleClick(1, e)}>
                {/* background-image need specified height to be auto, and so be correctly centered, too much of a pain */}
                {/* <div className="opened-image-container" style={{backgroundImage: `url("${currentShot.imageUrl}")`}}></div> */}
                {currentShotIndex - 1 >= 0 &&
                    <div className="opened-image-prev" onClick={prevShot} ref={arrowLeft}><LeftArrow /></div>
                }
                <img
                  src={currentShot.imageUrl}
                  alt=""
                  className="opened-image-container"
                  onClick={() => handleClick(0)}
                  onContextMenu={(e) => handleClick(1, e)}
                  onDragStart={(e) => e.preventDefault()}
                  ref={imgRef}
                />
                {currentShotIndex + 1 <= images.length - 1 &&
                    <div className="opened-image-next" onClick={nextShot} ref={arrowRight}><RightArrow/></div>
                }
            </div>
        </div>
    )
}

export default OpenedShot