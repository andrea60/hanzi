type WordPracticeStats = {
    word:string;
    confidence:number;
}

type PracticeSessionState = {
    id:string;
    isComplete:boolean;
    queue:string[],
    startTime:Date,
    completed:WordPracticeStats[]
}

// todo implement atom