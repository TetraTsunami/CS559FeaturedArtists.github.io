// Code Attribution: I referenced various sources, including Geeks for Geeks, ChatGPT, Stack Overflow, and some YouTube videos, to understand concepts related to drawing curves, camera, and position calculations. 
// These resources helped me learn how to implement the camera set up and the path for the bird. I also used them to learn how to draw the trees and buildings.
// I made sure to understand the methods and concepts instead of just copying code, which allowed me to gain a deeper understanding of the implementation.
const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const cameraSlider = document.getElementById('cameraSlider');
        const zoomSlider = document.getElementById('zoomSlider');

        let currentView = 'orbit';
        let time = 0;
        let showPath = true;
        let currentPathIndex = 0;

        const pathTypes = [
            {
                name: "Figure-8",
                func: (t) => {
                    const scale = 150;
                    return {
                        x: scale * Math.sin(0.5 * t) * Math.cos(t),
                        y: 100 + scale * 0.2 * Math.sin(2 * t),
                        z: scale * Math.cos(0.5 * t) * Math.sin(t)
                    };
                }
            },
            {
                name: "Spiral",
                func: (t) => {
                    const scale = 150;
                    return {
                        x: scale * Math.cos(t) * (1 - Math.cos(t/8)/2),
                        y: 100 + 50 * Math.sin(t/2),
                        z: scale * Math.sin(t) * (1 - Math.cos(t/8)/2)
                    };
                }
            },
            {
                name: "Loop-de-loop",
                func: (t) => {
                    const scale = 150;
                    return {
                        x: scale * Math.cos(t),
                        y: 100 + scale * 0.5 * Math.sin(2 * t),
                        z: scale * Math.sin(t) * (1 + 0.5 * Math.cos(2 * t))
                    };
                }
            },
            {
                name: "Wave",
                func: (t) => {
                    const scale = 150;
                    return {
                        x: scale * Math.cos(t),
                        y: 100 + scale * 0.3 * Math.sin(3 * t),
                        z: scale * Math.sin(t)
                    };
                }
            }
        ];
        
        class Cloud {
            constructor() {
                this.x = Math.random() * 1000 - 500;
                this.y = Math.random() * 100 + 100;
                this.z = Math.random() * 1000 - 500;
                this.size = Math.random() * 30 + 20;
                this.speed = Math.random() * 0.2 + 0.1;
            }

            update() {
                this.x += this.speed;
                if (this.x > 500) this.x = -500;
            }

            draw(context, project3DPoint) {
                const projected = project3DPoint([this.x, this.y, this.z]);
                const scale = Math.max(0.2, 1 - (projected.z / 1000));
                
                context.save();
                context.translate(projected.x, projected.y);
                context.scale(scale, scale);
                
                context.fillStyle = 'rgba(255, 255, 255, 0.8)';
                context.beginPath();
                context.arc(0, 0, this.size, 0, Math.PI * 2);
                context.arc(this.size * 0.5, -this.size * 0.2, this.size * 0.7, 0, Math.PI * 2);
                context.fill();
                
                context.restore();
            }
        }

        class Tree {
            constructor(x, z) {
                this.x = x;
                this.z = z;
                this.height = Math.random() * 20 + 40;
                this.width = this.height * 0.3;
                this.color = '#228B22';
            }

            draw(context, project3DPoint) {
                const base = project3DPoint([this.x, 0, this.z]);
                const top = project3DPoint([this.x, this.height, this.z]);
                const scale = Math.max(0.2, 1 - (base.z / 1000));

                // trunk
                context.strokeStyle = '#654321';
                context.lineWidth = 3 * scale;
                context.beginPath();
                context.moveTo(base.x, base.y);
                context.lineTo(top.x, top.y);
                context.stroke();

                //leafs
                context.fillStyle = this.color;
                const leftBase = project3DPoint([this.x - this.width, this.height * 0.6, this.z]);
                const rightBase = project3DPoint([this.x + this.width, this.height * 0.6, this.z]);
                
                context.beginPath();
                context.moveTo(top.x, top.y);
                context.lineTo(leftBase.x, leftBase.y);
                context.lineTo(rightBase.x, rightBase.y);
                context.closePath();
                context.fill();
            }
        }

        class Building {
            constructor(x, z) {
                this.x = x;
                this.z = z;
                this.width = Math.random() * 30 + 20;
                this.height = Math.random() * 100 + 50;
                this.depth = Math.random() * 30 + 20;
                this.color = '#A0A0A0';
            }

            draw(context, project3DPoint) {
                const points = [
                    project3DPoint([this.x - this.width/2, 0, this.z + this.depth/2]),
                    project3DPoint([this.x + this.width/2, 0, this.z + this.depth/2]),
                    project3DPoint([this.x + this.width/2, this.height, this.z + this.depth/2]),
                    project3DPoint([this.x - this.width/2, this.height, this.z + this.depth/2])
                ];

                context.fillStyle = this.color;
                context.beginPath();
                context.moveTo(points[0].x, points[0].y);
                context.lineTo(points[1].x, points[1].y);
                context.lineTo(points[2].x, points[2].y);
                context.lineTo(points[3].x, points[3].y);
                context.closePath();
                context.fill();
                context.stroke();
            }
        }

        
        const clouds = Array(10).fill(0).map(() => new Cloud());
        const trees = Array(20).fill(0).map(() => 
            new Tree((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000)
        );
        const buildings = Array(10).fill(0).map(() =>
            new Building((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800)
        );

        const camera = {
            position: vec3.create(),
            target: vec3.create(),
            up: vec3.fromValues(0, 1, 0)
        };

        const viewMatrix = mat4.create();
        const projMatrix = mat4.create();

        function updateCamera(birdPosition) {
            const zoomFactor = zoomSlider.value / 50;
            const cameraDistance = 400 * zoomFactor;
            const cameraHeight = 150 * zoomFactor;
            const viewAngle = cameraSlider.value * 0.02 * Math.PI;

            switch(currentView) {
                case 'orbit':
                    vec3.set(camera.position,
                        cameraDistance * Math.sin(viewAngle),
                        cameraHeight,
                        cameraDistance * Math.cos(viewAngle)
                    );
                    vec3.set(camera.target, 0, 0, 0);
                    break;
                    
                case 'follow':
                    const followDistance = 200 * zoomFactor;
                    const direction = getFlightDirection(time);
                    vec3.set(camera.position,
                        birdPosition[0] - direction.x * followDistance,
                        birdPosition[1] + 100 * zoomFactor,
                        birdPosition[2] - direction.z * followDistance
                    );
                    vec3.copy(camera.target, birdPosition);
                    break;
            }

            mat4.lookAt(viewMatrix, camera.position, camera.target, camera.up);
            mat4.perspective(projMatrix, Math.PI/4, canvas.width/canvas.height, 1, 3000);
        }

        function project3DPoint(point) {
            const vec = vec4.fromValues(point[0], point[1], point[2], 1.0);
            vec4.transformMat4(vec, vec, viewMatrix);
            vec4.transformMat4(vec, vec, projMatrix);

            if (vec[3] !== 0) {
                vec[0] /= vec[3];
                vec[1] /= vec[3];
            }

            return {
                x: (vec[0] + 1) * canvas.width / 2,
                y: (-vec[1] + 1) * canvas.height / 2,
                z: vec[2]
            };
        }

        function drawGround() {
            const gridSize = 500;
            const step = 50;

            context.strokeStyle = 'rgba(60, 120, 60, 0.3)';
            context.lineWidth = 1;

            for(let x = -gridSize; x <= gridSize; x += step) {
                for(let z = -gridSize; z <= gridSize; z += step) {
                    const points = [
                        project3DPoint([x, 0, z]),
                        project3DPoint([x + step, 0, z]),
                        project3DPoint([x + step, 0, z + step]),
                        project3DPoint([x, 0, z + step])
                    ];
                    
                    context.fillStyle = '#90EE90';
                    context.beginPath();
                    context.moveTo(points[0].x, points[0].y);
                    points.slice(1).forEach(point => context.lineTo(point.x, point.y));
                    context.closePath();
                    context.fill();
                    context.stroke();
                }
            }
        }

        function getFlightPosition(t) {
            return pathTypes[currentPathIndex].func(t);
        }

        function getFlightDirection(t) {
            const delta = 0.01;
            const pos1 = getFlightPosition(t);
            const pos2 = getFlightPosition(t + delta);
            
            return {
                x: pos2.x - pos1.x,
                y: pos2.y - pos1.y,
                z: pos2.z - pos1.z
            };
        }

        function drawMechanicalBird(x, y, z) {
            const projected = project3DPoint([x, y, z]);
            const scale = Math.max(0.3, 1 - (vec3.distance(camera.position, [x, y, z]) / 1000));
            
            const direction = getFlightDirection(time);
            const rotation = Math.atan2(direction.z, direction.x);

            context.save();
            context.translate(projected.x, projected.y);
            context.scale(scale, scale);
            context.rotate(rotation);

            // body
            context.fillStyle = '#708090';
            context.beginPath();
            context.moveTo(-30, -15);
            context.lineTo(30, -15);
            context.lineTo(20, 15);
            context.lineTo(-20, 15);
            context.closePath();
            context.fill();
            context.stroke();

            // wings with animation
            const wingAngle = Math.sin(time * 5) * Math.PI / 6;

            // left wing
            context.save();
            context.translate(-10, 0);
            context.rotate(wingAngle);
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(-40, -30);
            context.lineTo(-30, 0);
            context.closePath();
            context.fillStyle = '#A0A0A0';
            context.fill();
            context.stroke();
            context.restore();

            // right wing
            context.save();
            context.translate(10, 0);
            context.rotate(-wingAngle);
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(40, -30);
            context.lineTo(30, 0);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();

            // head
            context.fillStyle = '#808080';
            context.beginPath();
            context.arc(35, 0, 12, 0, Math.PI * 2);
            context.fill();
            context.stroke();

            // beak
            context.beginPath();
            context.moveTo(45, -3);
            context.lineTo(60, 0);
            context.lineTo(45, 3);
            context.closePath();
            context.fillStyle = '#606060';
            context.fill();
            context.stroke();

            context.restore();
        }

        function drawPath() {
            if (!showPath) return;

            context.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            context.lineWidth = 2;
            context.beginPath();

            let firstPoint = true;
            for(let t = time - 2; t <= time; t += 0.1) {
                const pos = getFlightPosition(t);
                const projected = project3DPoint([pos.x, pos.y, pos.z]);

                if (firstPoint) {
                    context.moveTo(projected.x, projected.y);
                    firstPoint = false;
                } else {
                    context.lineTo(projected.x, projected.y);
                }
            }

            context.stroke();
        }

        function setView(view) {
            currentView = view;
        }

        function togglePath() {
            showPath = !showPath;
        }

        function cyclePath() {
            currentPathIndex = (currentPathIndex + 1) % pathTypes.length;
            document.getElementById('pathName').textContent = pathTypes[currentPathIndex].name;
        }

        function animate() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            const birdPos = getFlightPosition(time);
            const birdPosition = vec3.fromValues(birdPos.x, birdPos.y, birdPos.z);

            updateCamera(birdPosition);

            clouds.forEach(cloud => {
                cloud.update();
                cloud.draw(context, project3DPoint);
            });

            drawGround();
            
            [...buildings, ...trees].sort((a, b) => {
                const distA = vec3.distance(camera.position, [a.x, 0, a.z]);
                const distB = vec3.distance(camera.position, [b.x, 0, b.z]);
                return distB - distA;
            }).forEach(obj => obj.draw(context, project3DPoint));

            drawPath();
            drawMechanicalBird(birdPos.x, birdPos.y, birdPos.z);

            time += 0.02;
            requestAnimationFrame(animate);
        }

        animate();