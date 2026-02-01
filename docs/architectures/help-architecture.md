# Help Architecture Documentation

This document categorizes all AS3 help files into **ENGINE** (business logic we need) and **VIEW** (UI code we ignore).

> **Rule**: AS3 source in `source_as/` is the source of truth.

---

## Summary

| Category | Count | Description                                                                |
|----------|-------|----------------------------------------------------------------------------|
| ENGINE   | 22    | Help data, CFH logic, registries, name change handling, guide session data |
| VIEW     | 12    | Help UI windows, controllers with heavy window management                  |

---

## ENGINE FILES (We Need These)

### Core Help System

| AS3 File                     | Purpose                                                                                                                                                                                   | Status |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `help/HabboHelp.as`          | Main help component - orchestrates all help subsystems, handles server events, manages report types (EMERGENCY, GUIDE, IM, ROOM, BULLY, THREAD, MESSAGE, PHOTO), coordinates with toolbar | TODO   |
| `help/IHabboHelp.as`         | Interface for help component - public API for reporting users/rooms/threads/messages, name change, welcome screen, Habbo Way                                                              | TODO   |
| `help/CallForHelpManager.as` | CFH request handling - manages report submission, pending requests, builds CFH messages for server, handles bully reports with guardians                                                  | TODO   |
| `help/GuideHelpManager.as`   | Guide/helper coordination - manages HelpController, GuideSessionController, feedback, handles toolbar events for help/guide icons                                                         | TODO   |
| `help/SanctionInfo.as`       | User sanction data handler - processes sanction status events, formats ban/mute/alert messages, calculates probation days                                                                 | TODO   |

### CFH Registry System

| AS3 File                                                         | Purpose                                                                                                                       | Status |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|--------|
| `help/cfh/registry/chat/ChatRegistry.as`                         | Chat message storage for reports - stores up to 120 items, auto-purges messages older than 15 minutes, tracks selection state | TODO   |
| `help/cfh/registry/chat/ChatRegistryItem.as`                     | Chat message data model - userId, userName, text, roomId, roomName, selected flag, chatTime timestamp                         | TODO   |
| `help/cfh/registry/chat/ChatEventHandler.as`                     | Room chat listener - captures RSCE_CHAT_EVENT events, adds messages to ChatRegistry with room context                         | TODO   |
| `help/cfh/registry/instantmessage/InstantMessageRegistry.as`     | IM storage for reports - keyed by user ID, stores up to 20 messages per user, auto-purges old messages                        | TODO   |
| `help/cfh/registry/instantmessage/InstantMessageRegistryItem.as` | IM data model - index, userId, userName, text, selected flag, chatTime timestamp                                              | TODO   |
| `help/cfh/registry/instantmessage/InstantMessageEventHandler.as` | Console message listener - captures NewConsoleMessageEvent and RoomInviteEvent, stores in InstantMessageRegistry              | TODO   |
| `help/cfh/registry/user/UserRegistry.as`                         | User tracking for reports - stores up to 80 users, tracks roomId/roomName associations, provides lookup by userId             | TODO   |
| `help/cfh/registry/user/UserRegistryItem.as`                     | User data model - userId, userName, figure, roomId, roomName                                                                  | TODO   |

### Guide Session Data

| AS3 File                             | Purpose                                                                                                                  | Status |
|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------|--------|
| `help/guidehelp/GuideSessionData.as` | Guide session state model - role (GUIDE/USER), active window state, request type/description, user/guide IDs and figures | TODO   |
| `help/guidehelp/AnimationData.as`    | Animation frame data - window reference, asset name, frame count for waiting animations                                  | TODO   |

### Name Change System

| AS3 File                                  | Purpose                                                                                                                                        | Status |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `help/namechange/NameChangeController.as` | Name change logic - handles CheckUserNameResult/ChangeUserNameResult events, sends name validation/change messages, tracks own userId/userName | TODO   |
| `help/INameChangeUI.as`                   | Name change interface - API for name checking, changing, view management                                                                       | TODO   |

### Enums and Constants

| AS3 File                              | Purpose                                                                                                                                                    | Status |
|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `help/enum/GuideSessionStateEnum.as`  | Guide session states - CLOSED, ERROR, REJECTED, USER_CREATE/PENDING/ONGOING/FEEDBACK/THANKS, GUIDE_TOOL/ACCEPT/ONGOING/CLOSED, GUARDIAN_CHAT_REVIEW states | TODO   |
| `help/enum/class_3507.as`             | Position enum - LEFT (0), RIGHT (1) - used for welcome screen positioning                                                                                  | TODO   |
| `help/enum/class_3529.as`             | CFH result codes - CALL_FOR_HELP_SENT_OK, TOO_MANY_PENDING_CALLS, HAS_ABUSIVE_CALL                                                                         | TODO   |
| `help/enum/HabboHelpTrackingEvent.as` | Tracking events - HABBO_HELP_TRACKING_EVENT_CLOSED, HABBO_HELP_TRACKING_EVENT_DEFAULT                                                                      | TODO   |
| `help/enum/HabboHelpTutorialEvent.as` | Tutorial events - extends Event for avatar tutorial start, clothes icon lighting, avatar editor open/close                                                 | TODO   |

---

## VIEW FILES (We Ignore These)

### Help Window Controllers

| AS3 File                                 | Purpose                                                                                                         |
|------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `help/ChatReportController.as`           | Chat selection UI - populates chat message lists, handles selection highlighting, manages chat_report window    |
| `help/ChatReviewReporterFeedbackCtrl.as` | Reporter feedback popup UI - shows guide ticket resolution results via chat_review_reporter_feedback window     |
| `help/TopicsFlowHelpController.as`       | Topics-based help flow UI - manages multi-step reporting wizard with users/reason/topic/message/chat containers |
| `help/HabboWayController.as`             | Habbo Way viewer UI - page navigation, illustration display, quiz button via habbo_way modal dialog             |
| `help/HabboWayQuizController.as`         | Quiz UI - question display, answer selection, results analysis via habbo_way_quiz modal dialog                  |
| `help/SafetyBookletController.as`        | Safety booklet viewer UI - page navigation, quiz launching via safety_booklet modal dialog                      |
| `help/WelcomeScreenController.as`        | Welcome tooltip UI - animated positioning, toolbar integration via welcome_screen window                        |

### Guide Session UI

| AS3 File                                   | Purpose                                                                                                                                              |
|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `help/guidehelp/GuideSessionController.as` | Guide session UI - manages 15+ window states (guide_tool, guide_accept, user_ongoing, guardian_chat_review, etc.), chat messaging, countdown widgets |
| `help/guidehelp/HelpController.as`         | Help request UI - main_help modal, tour popup, pending ticket display windows                                                                        |

### Name Change UI

| AS3 File                                        | Purpose                                                                                            |
|-------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `help/namechange/NameChangeView.as`             | Name change wizard UI - welcome_name_change/selection/confirmation views, input validation display |
| `help/namechange/NameSuggestionListRenderer.as` | Name suggestion list UI - renders suggested names in grid layout with hover effects                |

---

## Architecture Analysis

### Component Relationships

```
HabboHelp (main component)
    |
    +-- CallForHelpManager (CFH handling)
    |       |
    |       +-- ChatReportController [VIEW]
    |
    +-- GuideHelpManager (guide/helper system)
    |       |
    |       +-- GuideSessionController [VIEW]
    |       |       +-- GuideSessionData [ENGINE]
    |       |
    |       +-- HelpController [VIEW]
    |       +-- ChatReviewReporterFeedbackCtrl [VIEW]
    |
    +-- TopicsFlowHelpController [VIEW]
    |
    +-- NameChangeController [ENGINE]
    |       +-- NameChangeView [VIEW]
    |
    +-- SanctionInfo [ENGINE]
    |
    +-- HabboWayController [VIEW]
    +-- HabboWayQuizController [VIEW]
    +-- SafetyBookletController [VIEW]
    +-- WelcomeScreenController [VIEW]
    |
    +-- Registries [ENGINE]
            +-- UserRegistry
            +-- ChatRegistry
            +-- InstantMessageRegistry
```

### Report Type Flow

1. **User initiates report** (context menu, button)
2. **HabboHelp.reportUser/Room/Thread/Message/Photo** called with target info
3. **CallForHelpManager** or **TopicsFlowHelpController** handles flow
4. **Registry data collected** - ChatRegistry/InstantMessageRegistry items selected
5. **CFH message sent** - CallForHelpMessageComposer with topic, message, chat entries
6. **Server responds** - CallForHelpResultMessageEvent with status

### Report Types

| Type | Constant              | Description                   |
|------|-----------------------|-------------------------------|
| 1    | REPORT_TYPE_EMERGENCY | Emergency help request        |
| 2    | REPORT_TYPE_GUIDE     | Guide request                 |
| 3    | REPORT_TYPE_IM        | Report via instant messages   |
| 4    | REPORT_TYPE_ROOM      | Room report                   |
| 6    | REPORT_TYPE_BULLY     | Bully report (uses guardians) |
| 7    | REPORT_TYPE_THREAD    | Forum thread report           |
| 8    | REPORT_TYPE_MESSAGE   | Forum message report          |
| 9    | REPORT_TYPE_PHOTO     | Photo/selfie report           |

### Guide Session States

```
User Flow:
  USER_CREATE -> USER_PENDING -> USER_ONGOING -> USER_FEEDBACK -> USER_THANKS
                      |                  |
                      v                  v
                  REJECTED      USER_GUIDE_DISCONNECTED

Guide Flow:
  GUIDE_TOOL -> GUIDE_ACCEPT -> GUIDE_ONGOING -> GUIDE_CLOSED

Guardian Flow:
  GUARDIAN_CHAT_REVIEW_ACCEPT -> WAIT_FOR_VOTERS -> VOTE -> WAIT_FOR_RESULTS -> RESULTS
```

### Server Messages

**Incoming**:
- `CallForHelpResultMessageEvent` - CFH submission result (success/pending/abusive)
- `CallForHelpReplyMessageEvent` - Moderator response to CFH
- `IssueCloseNotificationMessageEvent` - CFH closed notification
- `CallForHelpPendingCallsMessageEvent` - Pending CFH count
- `GuideSessionAttachedMessageEvent` - Guide attached to request
- `GuideSessionStartedMessageEvent` - Guide session active
- `GuideSessionMessageMessageEvent` - Chat message in session
- `GuideSessionEndedMessageEvent` - Session closed
- `GuideSessionErrorMessageEvent` - Session error (no guides, etc.)
- `ChatReviewSessionOfferedToGuideMessageEvent` - Guardian offer
- `ChatReviewSessionVotingStatusMessageEvent` - Guardian vote status
- `ChatReviewSessionResultsMessageEvent` - Guardian voting results
- `GuideTicketResolutionMessageEvent` - Reporter feedback trigger
- `SanctionStatusEvent` - User sanction info
- `CfhTopicsInitMessageEvent` - CFH topic categories
- `QuizDataMessageEvent` - Quiz questions
- `QuizResultsMessageEvent` - Quiz results
- `CheckUserNameResultMessageEvent` - Name availability
- `ChangeUserNameResultMessageEvent` - Name change result

**Outgoing**:
- `CallForHelpMessageComposer` - Submit CFH
- `CallForHelpFromIMMessageComposer` - CFH from instant messages
- `CallForHelpFromForumThreadMessageComposer` - CFH for thread
- `CallForHelpFromForumMessageMessageComposer` - CFH for message
- `CallForHelpFromPhotoMessageComposer` - CFH for photo
- `CallForHelpFromSelfieMessageComposer` - CFH for selfie
- `DeletePendingCallsForHelpMessageComposer` - Cancel pending CFH
- `GuideSessionCreateMessageComposer` - Request guide
- `GuideSessionGuideDecidesMessageComposer` - Guide accepts/rejects
- `GuideSessionMessageMessageComposer` - Send chat message
- `GuideSessionResolvedMessageComposer` - Mark session resolved
- `GuideSessionFeedbackMessageComposer` - Submit feedback
- `GuideSessionReportMessageComposer` - Report guide/user
- `ChatReviewSessionCreateMessageComposer` - Create bully review
- `ChatReviewGuideDecidesOnOfferMessageComposer` - Guardian accepts offer
- `ChatReviewGuideVoteMessageComposer` - Guardian votes
- `GetQuizQuestionsComposer` - Request quiz
- `PostQuizAnswersComposer` - Submit quiz answers
- `CheckUserNameMessageComposer` - Check name availability
- `ChangeUserNameInRoomMessageComposer` - Change name
- `GetCfhStatusMessageComposer` - Request sanction info

---

## Porting Considerations

### Required Subsystems
- Registry storage for chat/IM history
- CFH topic categorization
- Guide session state machine
- Server message handling
- Sanction/ban info display

### Complexity Areas
- **ChatRegistry**: Time-based auto-purge with selection state
- **GuideSessionController**: 15+ UI states with complex transitions
- **TopicsFlowHelpController**: Multi-step wizard with validation
- **Guardian voting**: Real-time status updates from multiple voters

### Simplification Options
- Registry purging could use simpler time-based cleanup
- Guide session could be simplified to fewer states
- Quiz could be server-rendered HTML instead of client UI
- Guardian voting UI could be simplified to basic polling
