window.addEventListener("load", () => {
    const tetrys_game = new TetrysGame();
});

class TetrysPoint {
    private point_x: number;
    private point_y: number;

    constructor(point_x: number, point_y: number) {
        this.point_x = point_x;
        this.point_y = point_y;
    }

    public offset(offset_x: number, offset_y: number): TetrysPoint {
        this.point_x += offset_x;
        this.point_y += offset_y;
        return this;
    }

    public offset_x(offset_x: number): TetrysPoint {
        this.point_x += offset_x;
        return this;
    }

    public offset_y(offset_y: number): TetrysPoint {
        this.point_y += offset_y;
        return this;
    }

    public get_x(): number {
        return this.point_x;
    }

    public get_y(): number {
        return this.point_y;
    }

    public clone(): TetrysPoint {
        return new TetrysPoint(this.point_x, this.point_y);
    }
}

class TetrysBlock {
    private block_color:  string;
    private block_layout: string[];

    constructor(block_color: string, block_layout: string[]) {
        this.block_color  = block_color;
        this.block_layout = block_layout;
    }

    public get_color(): string {
        return this.block_color;
    }

    public get_layout(): (string | null)[][] {
        return this.block_layout.map(line_string => line_string.split("").map(key => (key === "O") ? this.block_color : null));
    }
}

abstract class TetrysDimensions {
    // grid board
    public static readonly GRIDBOARD_GAP     = 10;
    public static readonly GRIDBOARD_OUTLINE = 1; // constant

    // game block
    public static readonly GAMEBLOCK_WIDTH      = 20;
    public static readonly GAMEBLOCK_HEIGHT     = 20;
    public static readonly GAMEBLOCK_HORIZONTAL = 10;
    public static readonly GAMEBLOCK_VERTICAL   = 20;
    public static readonly GAMEBLOCK_MAXIMUM    = 15;

    // gameboard
    public static readonly GAMEBOARD_BASE = new TetrysPoint(
        (TetrysDimensions.GRIDBOARD_GAP + TetrysDimensions.GRIDBOARD_OUTLINE),
        (TetrysDimensions.GRIDBOARD_GAP + TetrysDimensions.GRIDBOARD_OUTLINE)
    );
    public static readonly GAMEBOARD_WIDTH  = (TetrysDimensions.GAMEBLOCK_WIDTH  * TetrysDimensions.GAMEBLOCK_HORIZONTAL);
    public static readonly GAMEBOARD_HEIGHT = (TetrysDimensions.GAMEBLOCK_HEIGHT * TetrysDimensions.GAMEBLOCK_VERTICAL);

    // scoreboard
    public static readonly SCOREBOARD_BASE = new TetrysPoint(
        TetrysDimensions.dimension_sum([
            // OFFSET = gap + (outline + blocks + outline) + gap + (outline)
            (TetrysDimensions.GRIDBOARD_GAP     * 2),
            (TetrysDimensions.GRIDBOARD_OUTLINE * 3),
            (TetrysDimensions.GAMEBOARD_WIDTH   * 1)
        ]),
        (TetrysDimensions.GRIDBOARD_GAP + TetrysDimensions.GRIDBOARD_OUTLINE)
    );
    public static readonly SCOREBOARD_WIDTH = 100;

    // canvas
    public static readonly CANVAS_WIDTH = TetrysDimensions.dimension_sum([
        // WIDTH = gap + (outline + blocks + outline) + gap + (outline + scoreboard + outline) + gap
        (TetrysDimensions.GRIDBOARD_GAP     * 3),
        (TetrysDimensions.GRIDBOARD_OUTLINE * 4),
        (TetrysDimensions.GAMEBOARD_WIDTH   * 1),
        (TetrysDimensions.SCOREBOARD_WIDTH  * 1)
    ]);
    public static readonly CANVAS_HEIGHT = TetrysDimensions.dimension_sum([
        // HEIGHT = gap + (outline + blocks + outline) + gap
        (TetrysDimensions.GRIDBOARD_GAP     * 2),
        (TetrysDimensions.GRIDBOARD_OUTLINE * 2),
        (TetrysDimensions.GAMEBOARD_HEIGHT  * 1)
    ]);

    private static dimension_sum(dimension_array: Array<number>): number {
        return dimension_array.reduce((dimension_total, dimension_current) => dimension_total += dimension_current, 0);
    }
}

abstract class TetrysTheme {
    // grid board
    public static readonly GRIDBOARD_BACKGROUND = "#000000";
    public static readonly GRIDBOARD_OUTLINE    = "#ffffff";
    // game board
    public static readonly GAMEBOARD_WARNING    = "#dc2626";
    // score board
    public static readonly SCOREBOARD_TEXT      = "#ffffff";
    // death screen
    public static readonly DEATHSCREEN_TEXT     = "#dc2626";
    // blocks
    public static readonly GAMEBLOCK_LIST = [
        new TetrysBlock("#dc2626", ["OO_", "_OO"]),
        new TetrysBlock("#d97706", ["__O", "OOO"]),
        new TetrysBlock("#facc15", ["OO", "OO"]),
        new TetrysBlock("#65a30d", ["_OO", "OO_"]),
        new TetrysBlock("#0891b2", ["O", "O", "O", "O"]),
        new TetrysBlock("#2563eb", ["O__", "OOO"]),
        new TetrysBlock("#7c3aed", ["_O_", "OOO"])
    ] as TetrysBlock[];
}

class TetrysGame {
    private element_canvas:   HTMLCanvasElement;
    private element_context:  CanvasRenderingContext2D;
    private element_slider:   HTMLInputElement;
    private tetrys_renderer:  TetrysRenderer;
    private tetrys_gameboard: (string | null)[][];
    private tetrys_block:     {model: TetrysBlock, position: TetrysPoint};
    private tetrys_score:     number;
    private tetrys_speed:     number;
    private tetrys_ended:     boolean

    constructor() {
        // fetch elements
        this.element_canvas   = document.getElementById("canvas")    as HTMLCanvasElement;
        this.element_slider   = document.getElementById("slider")    as HTMLInputElement;
        this.element_context  = this.element_canvas.getContext("2d") as CanvasRenderingContext2D;
        this.tetrys_renderer  = new TetrysRenderer(this.element_canvas, this.element_context);
        this.tetrys_gameboard = [];
        this.tetrys_block     = {model: TetrysTheme.GAMEBLOCK_LIST[0], position: new TetrysPoint(0, 0)};
        this.tetrys_score     = 0;
        this.tetrys_speed     = 1;
        this.tetrys_ended     = false;
        // initialize game
        this.canvas_initialize();
        this.game_initialize();
        this.game_block_spawn();
        // game loop
        const tetrys_loop = () => {
            this.game_block_fall();
            this.tetrys_renderer.render_all(this);
            if (this.tetrys_ended) return;
            setTimeout(tetrys_loop, (200 / this.tetrys_speed));
        };
        tetrys_loop();
        // event listeners
        window.addEventListener("keypress", this.game_keypress.bind(this));
        this.element_slider.addEventListener("input", () => this.tetrys_speed = ((this.element_slider.value as unknown as number) / 100));
        (this.element_slider.value as unknown as number) = 100;
    }

    public game_keypress(keyboard_event: KeyboardEvent): void {
        if (this.tetrys_ended) return;
        switch (keyboard_event.key) {
            case "a":
                if (this.game_block_collide(-1, 0)) return;
                this.tetrys_block.position.offset_x(-1);
                break;
            case "s":
                if (this.game_block_collide(0, -1)) return;
                this.tetrys_block.position.offset_y(-1);
                break;
            case "d":
                if (this.game_block_collide(1, 0)) return;
                this.tetrys_block.position.offset_x(1);
                break;
            default:
                return;
        }
        this.tetrys_renderer.render_all(this);
    }

    public get_gameboard(): (string | null)[][] {
        return this.tetrys_gameboard;
    }

    public get_block(): {model: TetrysBlock, position: TetrysPoint} {
        return this.tetrys_block;
    }

    public get_score(): number {
        return this.tetrys_score;
    }

    public get_speed(): number {
        return this.tetrys_speed;
    }

    public get_ended(): boolean {
        return this.tetrys_ended;
    }

    private canvas_initialize(): void {
        this.element_canvas.width  = TetrysDimensions.CANVAS_WIDTH;
        this.element_canvas.height = TetrysDimensions.CANVAS_HEIGHT;
    }

    private game_initialize(): void {
        this.tetrys_gameboard = new Array(TetrysDimensions.GAMEBLOCK_VERTICAL).fill([]).map(() => new Array(TetrysDimensions.GAMEBLOCK_HORIZONTAL).fill(null));
        this.tetrys_block     = {model: TetrysTheme.GAMEBLOCK_LIST[0], position: new TetrysPoint(0, 0)};
        this.tetrys_score     = 0;
        this.tetrys_ended     = false;
    }

    private game_block_spawn(): void {
        const block_list  = TetrysTheme.GAMEBLOCK_LIST;
        const block_new   = block_list[Math.floor(Math.random() * block_list.length)];
        const block_width = block_new.get_layout()[0].length;
        const block_y     = (TetrysDimensions.GAMEBLOCK_VERTICAL - 1);
        const block_x     = Math.floor((TetrysDimensions.GAMEBLOCK_HORIZONTAL / 2) - (block_width / 2));
        this.tetrys_block = {model: block_new, position: new TetrysPoint(block_x, block_y)};
    }

    private game_block_fall(): void {
        if (this.game_block_collide(0, -1) !== true) {
            this.tetrys_block.position.offset_y(-1);
            return;
        }
        if (this.tetrys_block.position.get_y() >= TetrysDimensions.GAMEBLOCK_MAXIMUM) {
            this.game_end();
            return;
        }
        this.game_block_anchor();
        this.game_block_filled();
        this.game_block_spawn();
    }

    private game_block_collide(offset_x: number, offset_y: number): boolean {
        const block_layout   = this.tetrys_block.model.get_layout();
        const block_position = this.tetrys_block.position.clone().offset(offset_x, offset_y);
        const block_width    = block_layout[0].length;
        const block_height   = block_layout.length;
        for (let index_x = 0; index_x < block_width; index_x++) {
            for (let index_y = 0; index_y < block_height; index_y++) {
                const position_x = (block_position.get_x() + index_x);
                const position_y = (block_position.get_y() - index_y);
                if (block_layout[index_y][index_x] === null)                               continue;
                if (position_x < 0 || TetrysDimensions.GAMEBLOCK_HORIZONTAL <= position_x) return true;
                if (position_y < 0)                                                        return true;
                if (this.tetrys_gameboard[position_y][position_x] !== null)                return true;
            }
        }
        return false;
    }

    private game_block_anchor(): void {
        const block_layout  = this.tetrys_block.model.get_layout();
        const block_width   = block_layout[0].length;
        const block_height  = block_layout.length;
        for (let index_x = 0; index_x < block_width; index_x++) {
            for (let index_y = 0; index_y < block_height; index_y++) {
                const position_x = (this.tetrys_block.position.get_x() + index_x);
                const position_y = (this.tetrys_block.position.get_y() - index_y);
                if (block_layout[index_y][index_x] === null) continue;
                this.tetrys_gameboard[position_y][position_x] = block_layout[index_y][index_x];
            }
        }
        this.tetrys_score += 10;
    }

    private game_block_filled(): void {
        const lines_incomplete =  this.tetrys_gameboard.filter(board_line => !board_line.map(board_block => board_block !== null).reduce((line_filled, block_filled) => line_filled && block_filled, true));
        const lines_cleared    =  (TetrysDimensions.GAMEBLOCK_VERTICAL - lines_incomplete.length);
        const lines_new        =  new Array(lines_cleared).fill([]).map(() => new Array(TetrysDimensions.GAMEBLOCK_HORIZONTAL).fill(null))
        this.tetrys_gameboard  =  [...lines_incomplete, ...lines_new];
        this.tetrys_score      += (100 * lines_cleared);
    }

    private game_end(): void {
        if (this.tetrys_ended) return;
        this.tetrys_ended = true;
        // style
        const window_element = document.getElementsByClassName("window")[0] as HTMLDivElement;
        window_element.style.backgroundColor = "#fecaca";
    }
}

class TetrysRenderer {
    private element_canvas:   HTMLCanvasElement;
    private element_context:  CanvasRenderingContext2D;
    private renderer_tasks:   {task: Function, basepoint: TetrysPoint}[];
    private tetrys_gameboard: (string | null)[][];
    private tetrys_instance:  TetrysGame;

    constructor(element_canvas: HTMLCanvasElement, element_context: CanvasRenderingContext2D) {
        this.element_canvas  = element_canvas;
        this.element_context = element_context;
        this.renderer_tasks  = [
            {task: this.render_background.bind(this),  basepoint: new TetrysPoint(0, 0)},
            {task: this.render_gameboard.bind(this),   basepoint: TetrysDimensions.GAMEBOARD_BASE},
            {task: this.render_scoreboard.bind(this),  basepoint: TetrysDimensions.SCOREBOARD_BASE},
            {task: this.render_deathscreen.bind(this), basepoint: new TetrysPoint(0, 0)}
        ];
        this.tetrys_gameboard = [];
        this.tetrys_instance  = (undefined as any);
    }

    public render_all(tetrys_instance:  TetrysGame): void {
        // initialize
        this.tetrys_instance             = tetrys_instance;
        this.tetrys_gameboard            = this.tetrys_instance.get_gameboard().map(gameboard_line => [...gameboard_line]);
        this.element_context.strokeStyle = TetrysTheme.GRIDBOARD_OUTLINE;
        // add fallen block to board
        const falling_layout   = this.tetrys_instance.get_block().model.get_layout();
        const falling_width    = falling_layout[0].length;
        const falling_height   = falling_layout.length;
        const falling_position = this.tetrys_instance.get_block().position;
        for (let index_x = 0; index_x < falling_width; index_x++) {
            for (let index_y = 0; index_y < falling_height; index_y++) {
                if (falling_layout[index_y][index_x] === null) continue;
                const position_x = (falling_position.get_x() + index_x);
                const position_y = (falling_position.get_y() - index_y);
                this.tetrys_gameboard[position_y][position_x] = falling_layout[index_y][index_x];
            }
        }
        // render components
        for (let task_index = 0; task_index < this.renderer_tasks.length; task_index++) {
            const task_data = this.renderer_tasks[task_index];
            // apply window offset
            this.element_context.save();
            this.element_context.translate(task_data.basepoint.get_x(), task_data.basepoint.get_y());
            // render content
            task_data.task();
            // reset window offset
            this.element_context.restore();
        }
    }

    private render_background(): void {
        this.element_context.fillStyle = TetrysTheme.GRIDBOARD_BACKGROUND;
        this.element_context.fillRect(0, 0, this.element_canvas.width, this.element_canvas.height);
    }

    private render_gameboard(): void {
        // render blocks
        for (let index_x = 0; index_x < TetrysDimensions.GAMEBLOCK_HORIZONTAL; index_x++) {
            for (let index_y = 0; index_y < TetrysDimensions.GAMEBLOCK_VERTICAL; index_y++) {
                const block_x     = (TetrysDimensions.GAMEBLOCK_WIDTH  * index_x);
                const block_y     = (TetrysDimensions.GAMEBLOCK_HEIGHT * index_y);
                const block_color = this.tetrys_gameboard[TetrysDimensions.GAMEBLOCK_VERTICAL - index_y - 1][index_x];
                if (block_color === null) continue;
                this.element_context.fillStyle = block_color;
                this.element_context.beginPath();
                this.element_context.rect(block_x, block_y, TetrysDimensions.GAMEBLOCK_WIDTH, TetrysDimensions.GAMEBLOCK_HEIGHT);
                this.element_context.fill();
                this.element_context.stroke();
            }
        } 
        // render outline
        this.element_context.beginPath();
        this.element_context.rect(0, 0, TetrysDimensions.GAMEBOARD_WIDTH, TetrysDimensions.GAMEBOARD_HEIGHT);
        this.element_context.stroke();
        // render maximum
        const maximum_height = (TetrysDimensions.GAMEBLOCK_HEIGHT * (TetrysDimensions.GAMEBLOCK_VERTICAL - TetrysDimensions.GAMEBLOCK_MAXIMUM));
        this.element_context.strokeStyle = TetrysTheme.GAMEBOARD_WARNING;
        this.element_context.beginPath();
        this.element_context.moveTo(0, maximum_height);
        this.element_context.lineTo(TetrysDimensions.GAMEBOARD_WIDTH, maximum_height);
        this.element_context.stroke();
    }

    private render_scoreboard(): void {
        // render outline
        this.element_context.beginPath();
        this.element_context.rect(0, 0, TetrysDimensions.SCOREBOARD_WIDTH, TetrysDimensions.GAMEBOARD_HEIGHT);
        this.element_context.stroke();
        // render text
        this.element_context.font = "15px serif";
        this.element_context.fillStyle = TetrysTheme.SCOREBOARD_TEXT;
        this.element_context.fillText(`Score: ${this.tetrys_instance.get_score()} pt`, 5, 20);
        this.element_context.fillText(`Speed: ${Math.ceil(this.tetrys_instance.get_speed() * 100)}%`, 5, 40);
        this.element_context.fillText(`Keys: [ASD]`, 5, 60);
    }

    private render_deathscreen(): void {
        if (this.tetrys_instance.get_ended() !== true) return;
        // style text
        this.element_context.font      = "bold 50px serif";
        this.element_context.textAlign = "center";
        this.element_context.fillStyle = TetrysTheme.DEATHSCREEN_TEXT;
        // render text
        const canvas_center = new TetrysPoint((TetrysDimensions.CANVAS_WIDTH / 2), (TetrysDimensions.CANVAS_HEIGHT / 2));
        this.element_context.fillText  ("YOU DIED!",                                  canvas_center.get_x(), (canvas_center.get_y() - 40));
        this.element_context.strokeText("YOU DIED!",                                  canvas_center.get_x(), (canvas_center.get_y() - 40));
        this.element_context.fillText  (`Score: ${this.tetrys_instance.get_score()} pt`, canvas_center.get_x(), (canvas_center.get_y() + 40));
        this.element_context.strokeText(`Score: ${this.tetrys_instance.get_score()} pt`, canvas_center.get_x(), (canvas_center.get_y() + 40));
    }
}