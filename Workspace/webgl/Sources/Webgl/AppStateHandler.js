

PX.AppStates =
{
      AppStateUnknown:              0
    , AppStateEntry:                1
    , AppStateEntryToIntro:         2
    , AppStateIntro:                3
    , AppStateIntroToLevel0:        4
    , AppStateLevel0:               5
    , AppStateLevel0ToLevel1:       6
    , AppStateLevel1:               7
    , AppStateLevel1ToLevel0:       8
    , AppStateLevel1ToLevel2:       9
    , AppStateLevel2:               10
    , AppStateLevel2ToLevel1:       11
};

PX.AppStatesString = 
[
      "AppStateUnknown"
    , "AppStateEntry"
    , "AppStateEntryToIntro"
    , "AppStateIntro"
    , "AppStateIntroToLevel0"
    , "AppStateLevel0"
    , "AppStateLevel0ToLevel1"
    , "AppStateLevel1"
    , "AppStateLevel1ToLevel0"
    , "AppStateLevel1ToLevel2"
    , "AppStateLevel2"
    , "AppStateLevel2ToLevel1"
];

//
PX.AppStateHandler = function()
{
    this.currentState       = PX.AppStates.AppStateUnknown;
    this.nextState          = PX.AppStates.AppStateUnknown;
    this.onStateChangeCBs   = [];
};


PX.AppStateHandler.prototype =
{
    constructor: PX.AppStateHandler


    , IsState: function( state )
    {
        return ( this.currentState === state );
    }

    // This func differs from ChangeState as it does the change immediately
    , SetState: function( state )
    {
        this.nextState = state;
        this.Update();
    }

    , GetCurrentState: function()
    {
        return this.currentState;
    }

    , GetNextState: function()
    {
        return this.nextState;
    }

    , ChangeState: function( state )
    {
        this.nextState = state;
    }

    , AddStateChangeCallback: function( cb )
    {
        this.onStateChangeCBs.push( cb );
    }

    , Update: function()
    {
        if( this.currentState !== this.nextState )
        {
            this.currentState = this.nextState;

            for( var i=0; i<this.onStateChangeCBs.length; ++i )
                this.onStateChangeCBs[i]( this.currentState );
        }
    }
};

var appStateMan = new PX.AppStateHandler();