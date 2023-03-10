import { getDatabase, ref, child, get } from "firebase/database";
import { useCallback, useEffect, useReducer, useState } from "react";
import Info from "../assets/icons/Info";
import { Filter } from "../components/Filter/Filter";
import ImageGrid from "../components/Grid";
import { Onboarding } from "../components/Onboarding/Onboarding";
import OpenedShot from "../components/OpenedShot/OpenedShot";
import { Settings } from "../components/Settings/Settings";
import { Shot } from "../types";
import { createInitialState, initialState, reducer } from "../utils/reducer";

export const Home = (props: any) => {
    const [shots, setShots] = useState([])
    const [allShots, setAllShots] = useState([])
    const [filteredShots, setFilteredShots] = useState<Shot[] | undefined>(undefined)
    const [shotCount, setShotCount] = useState(0)
    const [authorsSearch, setAuthorsSearch] = useState<string[]>([])
    const params = new URLSearchParams(window.location.search);
    const dbRef = ref(getDatabase());
    const [state, dispatch] = useReducer(reducer, initialState, createInitialState)
    const [openShot, setOpenShot] = useState(null)
    const [random, setRandom] = useState(Math.random())
    const [step, setStep] = useState(99)

    const firebaseObjToArray = (obj: any) => {
        let respShots = obj;
        respShots = Object.values(respShots)
        setShotCount(respShots.length)
        respShots.reverse();
        if (respShots.length > 100) {
          setShots(respShots.splice(0, 100))
          setAllShots(respShots)
        }
        else
          setShots(respShots)
    }

    useEffect(() => {
        get(child(dbRef, `${params.get("id")}`))
          .then((shots) => shots.exists() && firebaseObjToArray(shots.val()))
          .catch((error) => console.error(error))
    }, [])
    
    const handleLoadMore = () => setShots(shots.concat(allShots.splice(0, 100)))

    const onFilter = (term: any) => {
      if(!!!term) {
        setAuthorsSearch([])
        setFilteredShots(undefined)
        return 
      }
      // console.log(term)
      const everyShots = [...shots, ...allShots]
      const fltrdShots = everyShots.filter((item: Shot) => item.name.toLowerCase().includes(term.toLowerCase()))
      const authors = [...new Set(fltrdShots.map((item: Shot) => item.name))]
      setAuthorsSearch(authors)
      setFilteredShots(fltrdShots)
    }

    return (
        <div className="home">
          {step <= 3 && shots && shots.length > 0 &&
            <Onboarding
              randomShot={[...shots, ...allShots][Math.floor(random * [...shots, ...allShots].length)]}
              changeRandom={() => setRandom(Math.random())}
              step={step}
              setStep={setStep}
            />
          }
          <Filter autocomplete={authorsSearch} onFilter={onFilter} />
            {shots && shots.length > 0 && 
                <>
                    {openShot != null && 
                      <OpenedShot shot={openShot} closeShot={() => setOpenShot(null)} state={state} images={filteredShots || shots} />
                    }
                    <ImageGrid images={filteredShots || shots} borderOffset={5} state={state} setOpenShot={setOpenShot} />
                    {shotCount > 100 && allShots.length > 0 && !filteredShots &&
                        <div className="more-shots" onClick={handleLoadMore}>
                        Load more
                        </div>
                    }
                    {/* <div className="selectLink">
                      <span onClick={() => setLink(true)} className={link ? 'selectedLink' : ''}>
                        HTTP link
                      </span>
                      <span onClick={() => setLink(false)} className={!link ? 'selectedLink' : ''}>
                        App link
                      </span>
                    </div> */}
                    <Settings state={state} dispatch={dispatch} />
                    <div className="tutorial" onClick={() => setStep(0)}>
                      <Info />
                    </div>
                </>
            || 
                <div className="error-message">No id specified</div>
            }
        </div>
    )
}