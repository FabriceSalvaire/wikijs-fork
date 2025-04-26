####################################################################################################

"""This module implements a Pythonic translation of the Changelog of @mdi/font aka MDI aka Material Design Icons
"""

####################################################################################################

def _init() -> dict:
    mdi_changes = {}
    action = None
    for line in MDI_UPDATES_TXT.splitlines():
        line = line.strip()
        # print(line)
        if not line or line.startswith('#'):
            pass
        elif line.startswith('Version'):
            version = line[line.find(' '):].strip()
            action = None
        elif line == 'Updated':
            action = 'updated'
        elif line == 'Renamed':
            action = 'renamed'
        elif line == 'Removed':
            action = 'removed'
        else:
            _ = line.find(' ')
            if _ != -1:
                name = line[:_]
                left = line[_:].strip()
            else:
                name = line
                left = ''
            if action == 'renamed':
                new = left[3:]
                # print(f'{name} -> {new}   @{version}')
            elif action == 'removed':
                new = left.replace('- Use', '').replace('(use', '').replace(')', '').strip()
                # print(f'{name} ~> "{left}"   @{version}')
            if action != 'updated':
                if name in mdi_changes:
                    raise NameError(name)
                mdi_changes[name] = (action, version, new)
                # print(f'  {action} : {name} {version} {left}')
    return mdi_changes

####################################################################################################


# From https://pictogrammers.com/docs/library/mdi/releases/changelog
MDI_UPDATES_TXT = '''
Version 7.3.67
    Updated
        format-strikethrough-variant
        human-male-female-child
        image-remove
        login
        logout
        radioactive-circle-outline
        radioactive-off
        radioactive
        turbine

Version 7.2.96
    Renamed
        triangle-down-variant to triangle-down-outline

Version 7.1.96
    Renamed
        cloud-check-outline to cloud-check-variant-outline
        cloud-check to cloud-check-variant
        cloud-refresh to cloud-refresh-variant
    Updated
        bag-personal-tag-outline
        bag-personal-tag
        cloud-alert
        cloud-braces
        cloud-check-variant-outline
        cloud-check-variant
        cloud-circle
        cloud-download-outline
        cloud-download
        cloud-lock-outline
        cloud-lock
        cloud-off-outline
        cloud-outline
        cloud-percent-outline
        cloud-percent
        cloud-print
        cloud-printe-outline
        cloud-question
        cloud-refresh-variant
        cloud-search-outline
        cloud-search
        cloud-sync-outline
        cloud-sync
        cloud-sync
        cloud-tags
        cloud-upload-outline
        cloud-upload
        cloud
        could-sync-outline
        image-filter-drama
        progress-question

Version 7.0.96
    Removed
        android-messages - Use message-text instead.
        book-variant-multiple - Use bookmark-box-multiple instead.
        desktop-mac - Use monitor instead.
        desktop-mac-dashboard - Use monitor-dashboard instead.
        discord
        google-home
        tablet-android - Use tablet instead.
    Renamed
        diving-scuba to diving-scuba-mask
        email-send to email-arrow-right
        email-send-outline to email-arrow-right-outline
        email-receive to email-arrow-left
        email-receive-outline to email-arrow-left-outline
        format-textdirection-r-to-l to format-pilcrow-arrow-left
        format-textdirection-l-to-r to format-pilcrow-arrow-right
        globe-light to globe-light-outline
        google-controller to controller
        google-controller-off to controller-off
        lecturn to lectern
        mosque to mosque-outline
        receipt to receipt-text
        receipt-outline to receipt-text-outline
        silo to silo-outline
        text-to-speech to microphone-message
        text-to-speech-off to microphone-message-off
        timeline-help to timeline-question
        timeline-help-outline to timeline-question-outline
        vector-point to vector-point-select
    Updated
        calendar-filter-outline
        calendar-filter
        comment-check-outline
        comment-check
        spray-bottle

Version 6.9.96
    Updated
        account-arrow-down-outline
        account-arrow-down
        account-arrow-left-outline
        account-arrow-left
        account-arrow-right-outline
        account-arrow-right
        account-arrow-up-outline
        account-arrow-up
        account-wrench-outline
        account-wrench
        bank-check
        bank-off-outline
        bank-off
        calendar-account-outline
        calendar-account
        calendar-alert
        calendar-blank-outline
        calendar-check-outline
        calendar-cursor
        calendar-export
        calendar-filter-outline
        calendar-heart
        calendar-import
        calendar-lock-outline
        calendar-lock
        calendar-month-outline
        calendar-outline
        calendar-range-outline
        calendar-remove-outline
        calendar-star-outline
        calendar-star
        calendar-text-outline
        calendar-today-outline
        calendar-week-begin-outline
        calendar-week-outline
        calendar-weekend-outline
        calendar-weekend
        email-check-outline
        email-check
        email-lock
        email-minus-outline
        email-minus
        email-plus-outline
        email-plus
        email-receive
        email-send-outline
        email-send
        file-gif-box
        file-jpg-box
        file-pdf-box
        file-png-box
        folder-check-outline
        folder-check
        folder-edit-outline
        folder-edit
        folder-music-outline
        folder-music
        folder-plus-outline
        folder-plus
        folder-remove-outline
        folder-remove
        image-minus
        image-plus
        minus-thick
        playlist-check
        playlist-edit
        playlist-minus
        playlist-play
        playlist-plus
        playlist-remove
        playlist-star
        toolbox-outline
        toolbox
        white-balance-sunny

# Version 6.8.96
#         monitor-speaker-off
#         monitor-speaker

Version 6.7.96
    Updated
        church
        stadium

Version 6.6.96
    Updated
        barrel
        bell-badge-outline
        bug-check-outline
        bug-check
        content-save-alert-outline
        content-save-alert
        currency-btc
        currency-cny
        currency-eur-off
        currency-eur
        currency-gbp
        currency-jpy
        currency-rub
        currency-rupee
        currency-try
        fax
        fedora
        file-alert-outline
        file-alert
        file-check-outline
        file-check
        file-lock-outline
        file-lock
        file-plus-outline
        file-plus
        file-remove-outline
        file-remove
        folder-lock-open
        folder-lock
        home-battery-outline
        home-battery
        home-edit-outline
        home-export-outline
        home-flood
        home-import-outline
        home-lightbulb-outline
        home-minus-outline
        home-minus
        home-outline
        home-plus-outline
        home-outline
        home-plus-outline
        home-plus
        home-remove-outline
        home-remove
        home-thermometer-outline
        home-thermometer
        karate
        light-switch
        propane-tank-outline
        propane-tank
        sort-variant-lock-open
        sort-variant-lock
        sun-thermometer-outline
        sun-thermometer

Version 6.5.95

Version 6.4.95
    Updated
        account-lock-outline
        account-lock
        align-horizontal-center
        align-horizontal-left
        align-horizontal-right
        align-vertical-bottom
        align-vertical-center
        align-vertical-top
        copyright
        currency-eur-off
        currency-eur
        elevator-passenger
        ev-plug-ccs1
        ev-plug-ccs2
        ev-plug-chademo
        ev-plug-type1
        ev-plug-type2
        food-off
        food
        football
        hockey-sticks
        panorama-horizontal
        panorama-vertical
        panorama-wide-angle
        soccer
        surround-sound-2-0
        surround-sound-2-1
        surround-sound-3-1
        surround-sound-5-1-2
        surround-sound-5-1
        surround-sound-7-1
        volleyball

Version 6.3.95
    Updated
        account-key-outline
        account-key
        car-key
        cellphone-key
        file-key
        folder-key-network-outline
        folder-key-network
        folder-key-outline
        folder-key
        key-arrow-right
        key-change
        key-link
        key-minus
        key-outline
        key-plus
        key-remove
        key-star
        key-wireless
        key
        script-text-key-outline
        script-text-key
        table-key

Version 6.2.95
    Updated
        account-arrow-left-outline
        account-arrow-left
        account-arrow-right-outline
        account-arrow-right
        airplane-off
        application-import
        application-export

Version 6.1.95
    Removed
        adobe-acrobat
        adobe
        amazon-alexa
        amazon
        android-auto
        android-debug-bridge
        bandcamp
        battlenet
        blogger
        buffer
        cash-usd-outline
        cash-usd
        cellphone-android (use cellphone)
        cellphone-iphone (use cellphone)
        concourse-ci
        currency-usd-circle
        currency-usd-circle-outline
        do-not-disturb-off (use minus-circle-off)
        do-not-disturb (use minus-circle)
        douban
        file-pdf (use file-pdf-box)
        file-pdf-outline (use file-pdf-box)
        file-pdf-box-outline (use file-pdf-box)
        google-photos
        home-currency-usd
        laptop-chromebook (use laptop)
        laptop-mac (use laptop)
        laptop-windows (use laptop)
        microsoft-edge-legacy
        microsoft-yammer
        pdf-box (use file-pdf-box)
        plus-one (use numeric-positive-1)
        poll-box (use chart-box)
        poll-box-outline (use chart-box-outline)
        tablet-ipad (use tablet)
        telegram
        untappd
        vk
        xamarian-outline
        xing
        y-combinator
    Renamed
        apple-airplay to cast-variant
        application to application-outline
        application-cog to application-cog-outline
        application-settings to application-settings-outline
        bolnisi-cross to cross-bolnisi
        boom-gate-up to boom-gate-arrow-up
        boom-gate-up-outline to boom-gate-arrow-up-outline
        boom-gate-down to boom-gate-arrow-down
        boom-gate-down-outline to boom-gate-arrow-down-outline
        buddhism to dharmachakra
        cellphone-erase to cellphone-remove
        celtic-cross to cross-celtic
        christianity to cross
        christianity-outline to cross-outline
        face to face-man
        face-outline to face-man-outline
        face-profile-woman to face-woman-profile
        face-shimmer to face-man-shimmer
        face-shimmer-outline to face-man-shimmer-outline
        flash-circle to lightning-bolt-circle
        floor-lamp-variant to floor-lamp-torchiere-variant
        gif to file-gif-box
        gradient to gradient-vertical
        hand to hand-front-right
        hand-left to hand-back-left
        hand-right to hand-back-right
        hinduism to om
        human-greeting to human-greeting-variant
        iframe to application-brackets
        iframe-outline to application-brackets-outline
        iframe-array to application-array
        iframe-array-outline to application-array-outline
        iframe-braces to application-braces
        iframe-braces-outline to application-braces-outline
        iframe-parentheses to application-parentheses
        iframe-parentheses-outline to application-parentheses-outline
        iframe-variable to application-variable
        iframe-variable-outline to application-variable-outline
        islam to star-crescent
        judaism to star-david
        monitor-clean to monitor-shimmer
        pharmacy to mortar-pestle-plus
        sparkles to shimmer
        teach to human-male-board
        television-clean to television-shimmer
        text-subject to text-long
        twitter-retweet to repeat-variant
        voice-off to account-voice-off
    Updated
        asterisk
        battery-minus
        battery-plus
        bell-outline
        blender
        car-door-lock
        cctv
        chart-box-outline
        chili-hot
        chili-medium
        chili-mild
        chili-off
        file-pdf-box
        gate-arrow-right
        gate-open
        gate
        hamburger
        hiking
        human-greeting
        note-minus-outline
        note-minus
        note-plus-outline
        note-plus
        note-remove-outline
        note-remove
        piano
        pig-variant-outline
        pig-variant
        piggy-bank-outline
        piggy-bank
        roller-skate-off
        roller-skate
        rollerblade-off
        rollerblade
        sailboat
        sausage
        skate
        ski-cross-country
        ski
        snowboard
        toggle-switch-off-outline
        toggle-switch-outline
'''

####################################################################################################

MDI_CHANGES = _init()
