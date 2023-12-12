import { Fragment } from 'react'
import { useAppStore } from '../app/store'
import { getEndISO } from '../services/util'

import Block, { BlockProps } from './Block'
import Minutes, { TimeSpanTypes } from './Minutes'

export default function Hours({
  startISO,
  endISO,
  blocks,
  type,
  chopStart = false,
  dragContainer = '',
  noExtension = false,
}: {
  startISO: string
  endISO: string
  blocks: BlockProps[]
  type: TimeSpanTypes
  startWithHours?: boolean
  chopStart?: boolean
  dragContainer?: string
  noExtension?: boolean
}) {
  const formattedBlocks: BlockProps[] = []

  const dayStartEnd = useAppStore((state) => state.settings.dayStartEnd)
  const extendBlocks = useAppStore((state) => state.settings.extendBlocks)

  for (let i = 0; i < blocks.length; i++) {
    let nestedBlocks: BlockProps[] = []
    const thisBlock = blocks[i]
    const thisEndISO = getEndISO(thisBlock)
    while (blocks[i + 1] && (blocks[i + 1].startISO as string) < thisEndISO) {
      nestedBlocks.push(blocks[i + 1])
      i++
    }

    formattedBlocks.push({
      ...thisBlock,
      endISO:
        extendBlocks && thisEndISO === thisBlock.startISO
          ? blocks[i + 1]?.startISO ?? endISO
          : thisEndISO,
      blocks: nestedBlocks,
    })
  }

  const hideTimes = useAppStore(
    (state) => state.settings.hideTimes || state.viewMode === 'week'
  )

  const event = blocks[0]?.events?.[0]
  return (
    <div className={`pb-1 ${hideTimes ? 'space-y-1' : ''}`}>
      <Minutes
        dragContainer={dragContainer + '::' + startISO}
        type={type}
        startISO={startISO}
        endISO={formattedBlocks[0]?.startISO ?? endISO}
        chopEnd
        chopStart={
          chopStart || startISO === (formattedBlocks[0]?.startISO ?? endISO)
        }
        noExtension={noExtension}
      />

      {formattedBlocks.map(
        (
          {
            startISO: blockStartISO,
            endISO: blockEndISO,
            tasks,
            events,
            blocks,
          },
          i
        ) => (
          <Fragment key={`${blockStartISO}::${events[0]?.id}`}>
            <Block
              startISO={blockStartISO}
              endISO={blockEndISO}
              tasks={tasks}
              events={events}
              blocks={blocks}
              dragContainer={dragContainer + '::' + blockStartISO}
              type='event'
            />

            {!hideTimes && (
              <Minutes
                dragContainer={dragContainer + '::' + blockStartISO}
                type={type}
                startISO={blockEndISO as string}
                endISO={formattedBlocks[i + 1]?.startISO ?? endISO}
                chopEnd
                chopStart={blockStartISO === blockEndISO}
                noExtension={noExtension}
              />
            )}
          </Fragment>
        )
      )}

      {event && (event.location || event.notes) && (
        <div className='py-2 pl-6 text-xs'>
          <div className='w-full truncate'>{event.location}</div>
          <div className='w-full truncate text-muted'>{event.notes}</div>
        </div>
      )}
    </div>
  )
}
